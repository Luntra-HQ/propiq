"""
Test Supabase Connection and Database Schema
Verifies that we can connect to Supabase and that all required tables exist
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase package not installed")
    print("   Run: pip install supabase")
    sys.exit(1)


def test_connection():
    """Test basic connection to Supabase"""
    print("\n" + "=" * 80)
    print("🧪 Testing Supabase Connection")
    print("=" * 80)

    # Get credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ Missing environment variables:")
        print(f"   SUPABASE_URL: {'✓' if supabase_url else '✗'}")
        print(f"   SUPABASE_SERVICE_KEY: {'✓' if supabase_key else '✗'}")
        print("\n   Make sure your .env file has these variables set.")
        return False

    print(f"\n✓ Environment variables loaded")
    print(f"  SUPABASE_URL: {supabase_url}")
    print(f"  SUPABASE_SERVICE_KEY: {'*' * 20}...{supabase_key[-10:]}")

    try:
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        print(f"\n✓ Supabase client created successfully")

        # Test connection by querying a system table
        # This should work even if our custom tables don't exist yet
        print(f"\n🔌 Testing connection...")

        # Try to list tables (this will tell us if connection works and what tables exist)
        result = supabase.table("users").select("id").limit(1).execute()

        print(f"✓ Successfully connected to Supabase!")
        print(f"✓ 'users' table exists and is accessible")

        return True

    except Exception as e:
        error_str = str(e)
        print(f"\n❌ Connection failed: {error_str}")

        # Check for common error patterns
        if "relation" in error_str.lower() and "does not exist" in error_str.lower():
            print("\n⚠️  The database tables don't exist yet.")
            print("   You need to run the SQL schema script in Supabase SQL Editor.")
            print("   See WEEK2_SUPABASE_SETUP.md for instructions (Step 5).")
        elif "invalid" in error_str.lower() and "api" in error_str.lower():
            print("\n⚠️  Invalid API key or credentials.")
            print("   Check your SUPABASE_SERVICE_KEY in .env file.")
        elif "authentication" in error_str.lower():
            print("\n⚠️  Authentication failed.")
            print("   Make sure you're using the SERVICE_ROLE key, not the ANON key.")

        return False


def check_tables():
    """Check if all required tables exist"""
    print("\n" + "=" * 80)
    print("📋 Checking Database Tables")
    print("=" * 80)

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ Missing environment variables")
        return False

    try:
        supabase: Client = create_client(supabase_url, supabase_key)

        required_tables = [
            "users",
            "property_analyses",
            "subscriptions",
            "email_subscribers"
        ]

        tables_status = {}

        for table_name in required_tables:
            try:
                # Try to query the table (limit 0 to avoid loading data)
                result = supabase.table(table_name).select("*").limit(0).execute()
                tables_status[table_name] = "✓ exists"
                print(f"  ✓ {table_name}")
            except Exception as e:
                if "does not exist" in str(e).lower():
                    tables_status[table_name] = "✗ missing"
                    print(f"  ✗ {table_name} - NOT FOUND")
                else:
                    tables_status[table_name] = f"✗ error: {str(e)}"
                    print(f"  ✗ {table_name} - ERROR: {str(e)[:50]}")

        # Summary
        existing = sum(1 for status in tables_status.values() if "exists" in status)
        total = len(required_tables)

        print(f"\n📊 Summary: {existing}/{total} tables exist")

        if existing == total:
            print("✅ All required tables are present!")
            return True
        else:
            print("\n⚠️  Some tables are missing.")
            print("   Run the SQL schema script in Supabase SQL Editor.")
            print("   See WEEK2_SUPABASE_SETUP.md (Step 5) for the SQL script.")
            return False

    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return False


def test_basic_operations():
    """Test basic database operations"""
    print("\n" + "=" * 80)
    print("🔧 Testing Basic Operations")
    print("=" * 80)

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ Missing environment variables")
        return False

    try:
        supabase: Client = create_client(supabase_url, supabase_key)

        # Test: Count users
        print("\n📊 Testing user count...")
        result = supabase.table("users").select("id", count="exact").execute()
        user_count = result.count if hasattr(result, 'count') else len(result.data)
        print(f"  ✓ Users in database: {user_count}")

        # Test: Count analyses
        print("\n📊 Testing property analyses count...")
        result = supabase.table("property_analyses").select("id", count="exact").execute()
        analysis_count = result.count if hasattr(result, 'count') else len(result.data)
        print(f"  ✓ Property analyses in database: {analysis_count}")

        # Test: Count subscriptions
        print("\n📊 Testing subscriptions count...")
        result = supabase.table("subscriptions").select("id", count="exact").execute()
        sub_count = result.count if hasattr(result, 'count') else len(result.data)
        print(f"  ✓ Subscriptions in database: {sub_count}")

        # Test: Count email subscribers
        print("\n📊 Testing email subscribers count...")
        result = supabase.table("email_subscribers").select("id", count="exact").execute()
        email_count = result.count if hasattr(result, 'count') else len(result.data)
        print(f"  ✓ Email subscribers in database: {email_count}")

        print("\n✅ All basic operations successful!")
        return True

    except Exception as e:
        print(f"❌ Error during operations: {e}")
        return False


if __name__ == "__main__":
    print("\n🚀 Supabase Connection Test")
    print("=" * 80)

    # Test 1: Basic connection
    connection_ok = test_connection()

    if not connection_ok:
        print("\n" + "=" * 80)
        print("❌ Connection test failed. Fix the connection issues before proceeding.")
        print("=" * 80)
        sys.exit(1)

    # Test 2: Check tables
    tables_ok = check_tables()

    if not tables_ok:
        print("\n" + "=" * 80)
        print("⚠️  Tables are missing. Create them using the SQL script.")
        print("=" * 80)
        sys.exit(1)

    # Test 3: Basic operations
    operations_ok = test_basic_operations()

    # Final summary
    print("\n" + "=" * 80)
    if connection_ok and tables_ok and operations_ok:
        print("✅ ALL TESTS PASSED!")
        print("=" * 80)
        print("\n🎉 Your Supabase database is ready to use!")
        print("\nNext steps:")
        print("  1. Update backend routers to use database.py")
        print("  2. Test authentication endpoints")
        print("  3. Test property analysis endpoints")
        print("  4. Deploy to Azure")
    else:
        print("❌ SOME TESTS FAILED")
        print("=" * 80)
        print("\nPlease fix the issues above before proceeding.")

    print("=" * 80 + "\n")
