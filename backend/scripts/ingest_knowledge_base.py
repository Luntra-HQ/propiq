"""
Knowledge Base Ingestion Pipeline for PropIQ Support Agent

This script:
1. Loads documentation from various sources (Markdown, PDF, text files)
2. Chunks documents into semantic segments
3. Generates embeddings using Azure OpenAI
4. Stores in Supabase with pgvector for similarity search

Usage:
    python scripts/ingest_knowledge_base.py --source docs/ --category documentation
    python scripts/ingest_knowledge_base.py --source faqs.json --category faq
    python scripts/ingest_knowledge_base.py --rebuild  # Rebuild entire knowledge base
"""

import os
import sys
import argparse
import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Supabase client
try:
    from database_supabase import get_supabase_client
    supabase = get_supabase_client()
except Exception as e:
    print(f"❌ Failed to connect to Supabase: {e}")
    sys.exit(1)

# Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview"
)

EMBEDDING_MODEL = "text-embedding-3-small"  # 1536 dimensions
CHUNK_SIZE = 1000  # Characters per chunk
CHUNK_OVERLAP = 200  # Overlap between chunks for context continuity


class DocumentChunker:
    """Splits documents into semantic chunks"""

    @staticmethod
    def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
        """
        Split text into chunks with overlap

        Args:
            text: Input text
            chunk_size: Maximum characters per chunk
            overlap: Characters to overlap between chunks

        Returns:
            List of text chunks
        """
        if len(text) <= chunk_size:
            return [text]

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            # Try to break at paragraph boundary
            if end < len(text):
                # Look for paragraph break
                paragraph_break = text.rfind("\n\n", start, end)
                if paragraph_break > start:
                    end = paragraph_break
                else:
                    # Look for sentence break
                    sentence_break = text.rfind(". ", start, end)
                    if sentence_break > start:
                        end = sentence_break + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - overlap

        return chunks

    @staticmethod
    def load_markdown(file_path: Path) -> Dict[str, Any]:
        """
        Load and parse Markdown file

        Args:
            file_path: Path to .md file

        Returns:
            Dict with content and metadata
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract title from first # heading if exists
        title = file_path.stem
        lines = content.split('\n')
        if lines and lines[0].startswith('# '):
            title = lines[0].lstrip('# ').strip()

        return {
            "content": content,
            "metadata": {
                "source": file_path.name,
                "file_path": str(file_path),
                "title": title,
                "format": "markdown",
                "last_modified": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
            }
        }

    @staticmethod
    def load_json_faq(file_path: Path) -> List[Dict[str, Any]]:
        """
        Load FAQ from JSON file

        Expected format:
        [
            {"question": "...", "answer": "...", "category": "..."},
            ...
        ]

        Args:
            file_path: Path to JSON file

        Returns:
            List of FAQ documents
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            faqs = json.load(f)

        documents = []
        for faq in faqs:
            content = f"Q: {faq['question']}\n\nA: {faq['answer']}"
            documents.append({
                "content": content,
                "metadata": {
                    "source": "FAQ",
                    "category": faq.get("category", "General"),
                    "question": faq["question"],
                    "format": "faq"
                }
            })

        return documents

    @staticmethod
    def load_text(file_path: Path) -> Dict[str, Any]:
        """Load plain text file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        return {
            "content": content,
            "metadata": {
                "source": file_path.name,
                "file_path": str(file_path),
                "format": "text"
            }
        }


class KnowledgeBaseIngester:
    """Handles knowledge base ingestion into Supabase pgvector"""

    def __init__(self):
        self.chunker = DocumentChunker()
        self.ingested_count = 0
        self.failed_count = 0

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Azure OpenAI"""
        try:
            response = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"⚠️  Embedding generation failed: {e}")
            return None

    def ingest_document(self, content: str, metadata: Dict[str, Any], category: str = "general"):
        """
        Ingest a single document into knowledge base

        Args:
            content: Document content
            metadata: Document metadata (source, category, etc.)
            category: Document category override
        """
        # Update category if provided
        if category:
            metadata["category"] = category

        # Chunk the document
        chunks = self.chunker.chunk_text(content)

        print(f"📄 Processing '{metadata.get('source', 'unknown')}' ({len(chunks)} chunks)...")

        for idx, chunk in enumerate(chunks):
            # Generate embedding
            embedding = self.generate_embedding(chunk)
            if not embedding:
                print(f"  ⚠️  Chunk {idx + 1}/{len(chunks)} failed (embedding error)")
                self.failed_count += 1
                continue

            # Add chunk index to metadata
            chunk_metadata = {
                **metadata,
                "chunk_index": idx,
                "total_chunks": len(chunks)
            }

            # Insert into Supabase
            try:
                supabase.table("support_knowledge_base").insert({
                    "content": chunk,
                    "embedding": embedding,
                    "metadata": chunk_metadata,
                    "created_at": datetime.utcnow().isoformat()
                }).execute()

                self.ingested_count += 1
                print(f"  ✅ Chunk {idx + 1}/{len(chunks)} ingested")

            except Exception as e:
                print(f"  ❌ Chunk {idx + 1}/{len(chunks)} failed: {e}")
                self.failed_count += 1

    def ingest_directory(self, directory: Path, category: str = "documentation"):
        """
        Recursively ingest all supported files from directory

        Args:
            directory: Path to directory
            category: Category for all documents in directory
        """
        supported_extensions = {".md", ".txt", ".json"}

        for file_path in directory.rglob("*"):
            if file_path.is_file() and file_path.suffix in supported_extensions:
                try:
                    if file_path.suffix == ".md":
                        doc = self.chunker.load_markdown(file_path)
                        self.ingest_document(doc["content"], doc["metadata"], category)

                    elif file_path.suffix == ".txt":
                        doc = self.chunker.load_text(file_path)
                        self.ingest_document(doc["content"], doc["metadata"], category)

                    elif file_path.suffix == ".json":
                        # Assume FAQ format
                        faqs = self.chunker.load_json_faq(file_path)
                        for faq in faqs:
                            self.ingest_document(faq["content"], faq["metadata"], "faq")

                except Exception as e:
                    print(f"❌ Failed to process {file_path}: {e}")
                    self.failed_count += 1

    def clear_knowledge_base(self):
        """Clear all documents from knowledge base (for rebuild)"""
        print("🗑️  Clearing existing knowledge base...")
        try:
            # Delete all rows from support_knowledge_base table
            supabase.table("support_knowledge_base").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print("✅ Knowledge base cleared")
        except Exception as e:
            print(f"⚠️  Failed to clear knowledge base: {e}")

    def print_summary(self):
        """Print ingestion summary"""
        print("\n" + "=" * 60)
        print("📊 INGESTION SUMMARY")
        print("=" * 60)
        print(f"✅ Successfully ingested: {self.ingested_count} chunks")
        print(f"❌ Failed: {self.failed_count} chunks")
        print(f"📈 Success rate: {(self.ingested_count / (self.ingested_count + self.failed_count) * 100):.1f}%")
        print("=" * 60)


def create_sample_knowledge_base():
    """Create sample knowledge base content for testing"""
    sample_docs = [
        {
            "content": """# PropIQ Property Analysis Overview

PropIQ uses AI to analyze real estate investment opportunities. Our platform provides:

## Key Features
- Market trend analysis with neighborhood insights
- Comparable property data and pricing trends
- Financial projections including ROI and cash flow
- Investment recommendations (proceed, negotiate, or walk away)

## How It Works
1. Enter a property address
2. Add optional financial details (purchase price, down payment, etc.)
3. Receive comprehensive AI-generated analysis within seconds
4. Export results as PDF for sharing

The analysis is powered by GPT-4 and trained on millions of real estate transactions.""",
            "metadata": {
                "source": "Property Analysis Guide",
                "category": "features",
                "format": "documentation"
            }
        },
        {
            "content": """# PropIQ Subscription Plans

## Free Plan
- 3 trial property analyses
- No credit card required
- Basic features included
- Great for trying out the platform

## Starter Plan - $29/month
- 20 property analyses per month
- PDF export functionality
- Email support
- All basic features

## Pro Plan - $79/month
- 100 property analyses per month
- Property Advisor multi-agent system
- Priority email support
- Advanced analytics
- API access (beta)

## Elite Plan - $199/month
- Unlimited property analyses
- Dedicated account manager
- Priority support (24/7)
- Custom integrations
- White-label options (enterprise)

You can upgrade or downgrade at any time. No long-term contracts required.""",
            "metadata": {
                "source": "Pricing Guide",
                "category": "pricing",
                "format": "documentation"
            }
        },
        {
            "content": """# How to Analyze a Property in PropIQ

## Step-by-Step Guide

1. **Log in to PropIQ**
   - Go to app.propiq.com
   - Sign in with your credentials

2. **Navigate to Analysis**
   - Click "Analyze Property" button in dashboard
   - Or use the quick action menu

3. **Enter Property Address**
   - Type the full property address
   - PropIQ will auto-complete and verify the address

4. **Add Financial Details (Optional)**
   - Purchase price
   - Down payment amount
   - Expected rental income
   - Monthly expenses
   - Interest rate

5. **Run Analysis**
   - Click "Analyze" button
   - Wait 10-30 seconds for AI processing

6. **Review Results**
   - Market insights
   - Financial projections
   - Investment recommendation
   - Risk assessment

7. **Export or Save**
   - Download PDF report
   - Save to your properties dashboard

## Tips
- More financial details = more accurate analysis
- You can re-analyze properties with updated data
- Analyses count against your monthly limit""",
            "metadata": {
                "source": "How-To Guide",
                "category": "tutorials",
                "format": "documentation"
            }
        },
        {
            "content": """# PropIQ Property Advisor (Pro/Elite Feature)

The Property Advisor is an advanced multi-agent AI system available to Pro and Elite subscribers.

## What It Does

The Property Advisor uses 4 specialized AI agents:

1. **Market Analyst Agent**
   - Researches neighborhood trends
   - Analyzes comparable properties
   - Provides market outlook

2. **Deal Analyst Agent**
   - Calculates financial metrics (ROI, cap rate, cash-on-cash return)
   - Projects cash flow scenarios
   - Estimates appreciation potential

3. **Risk Analyst Agent**
   - Identifies investment risks
   - Analyzes downside scenarios
   - Provides risk mitigation strategies

4. **Action Planner Agent**
   - Creates step-by-step execution plan
   - Suggests negotiation strategies
   - Provides timeline recommendations

## How to Access

1. Upgrade to Pro or Elite plan
2. Go to any property analysis
3. Click "Run Property Advisor"
4. Wait 2-5 minutes for deep analysis
5. Receive comprehensive multi-agent report

## Use Cases
- Complex investment decisions
- Commercial real estate analysis
- Portfolio expansion planning
- Due diligence for high-value properties""",
            "metadata": {
                "source": "Property Advisor Guide",
                "category": "features",
                "format": "documentation"
            }
        },
        {
            "content": """# Troubleshooting Common Issues

## Property Analysis Failed

**Symptoms:** Error message when trying to analyze a property

**Solutions:**
1. Check that the address is valid and complete
2. Ensure you haven't exceeded your monthly analysis limit
3. Try refreshing the page
4. Clear browser cache and cookies
5. Contact support if issue persists

## Can't Log In

**Symptoms:** Login fails or password not recognized

**Solutions:**
1. Verify email address is correct
2. Use "Forgot Password" to reset
3. Check for email typo during signup
4. Contact support@propiq.com for account recovery

## Subscription Payment Failed

**Symptoms:** Payment declined or subscription cancelled

**Solutions:**
1. Update payment method in Settings → Billing
2. Check with your bank for declined transaction
3. Ensure sufficient funds or credit limit
4. Try alternative payment method
5. Contact support for billing assistance

## PDF Export Not Working

**Symptoms:** PDF download fails or file is corrupted

**Solutions:**
1. Use Chrome or Firefox browser (Safari may have issues)
2. Disable browser pop-up blocker
3. Check file permissions and download folder
4. Try exporting from a different device
5. Contact support if problem continues""",
            "metadata": {
                "source": "Troubleshooting Guide",
                "category": "support",
                "format": "documentation"
            }
        }
    ]

    return sample_docs


def main():
    parser = argparse.ArgumentParser(
        description="Ingest documents into PropIQ support knowledge base"
    )
    parser.add_argument(
        "--source",
        type=str,
        help="Path to document or directory to ingest"
    )
    parser.add_argument(
        "--category",
        type=str,
        default="general",
        help="Category for ingested documents (default: general)"
    )
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="Clear existing knowledge base and rebuild from scratch"
    )
    parser.add_argument(
        "--sample",
        action="store_true",
        help="Ingest sample knowledge base content for testing"
    )

    args = parser.parse_args()

    ingester = KnowledgeBaseIngester()

    # Clear knowledge base if rebuilding
    if args.rebuild:
        ingester.clear_knowledge_base()

    # Ingest sample content
    if args.sample:
        print("📚 Ingesting sample knowledge base content...")
        sample_docs = create_sample_knowledge_base()
        for doc in sample_docs:
            ingester.ingest_document(
                content=doc["content"],
                metadata=doc["metadata"],
                category=doc["metadata"]["category"]
            )

    # Ingest from source path
    elif args.source:
        source_path = Path(args.source)

        if not source_path.exists():
            print(f"❌ Source path does not exist: {source_path}")
            sys.exit(1)

        if source_path.is_dir():
            print(f"📁 Ingesting directory: {source_path}")
            ingester.ingest_directory(source_path, args.category)
        else:
            # Single file ingestion
            print(f"📄 Ingesting file: {source_path}")

            if source_path.suffix == ".md":
                doc = ingester.chunker.load_markdown(source_path)
                ingester.ingest_document(doc["content"], doc["metadata"], args.category)

            elif source_path.suffix == ".txt":
                doc = ingester.chunker.load_text(source_path)
                ingester.ingest_document(doc["content"], doc["metadata"], args.category)

            elif source_path.suffix == ".json":
                faqs = ingester.chunker.load_json_faq(source_path)
                for faq in faqs:
                    ingester.ingest_document(faq["content"], faq["metadata"], "faq")

            else:
                print(f"❌ Unsupported file format: {source_path.suffix}")
                sys.exit(1)

    else:
        print("❌ Must specify --source, --sample, or --rebuild")
        parser.print_help()
        sys.exit(1)

    # Print summary
    ingester.print_summary()

    print("\n✅ Knowledge base ingestion complete!")
    print(f"💡 Test the knowledge base at: POST /api/v1/support/rag/chat")


if __name__ == "__main__":
    main()
