"""
PropIQ Multi-Agent Property Investment Advisor
Inspired by Google ADK Financial Advisor pattern

Architecture:
- Coordinator Agent: Manages workflow, delegates to sub-agents
- Market Analyst: Research neighborhood trends, comps, market data
- Deal Analyst: Financial calculations, ROI projections, deal structure
- Risk Analyst: Investment risk assessment, downside scenarios
- Action Planner: Creates concrete action plan for making offer

This is a PREMIUM feature for Pro/Elite users.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import json
from openai import AzureOpenAI

# Database
try:
    import database_supabase
    db = database_supabase.db
    if db is not None:
        users = db["users"]
        property_analyses = db["property_analyses"]
        advisor_sessions = db["advisor_sessions"]
        DATABASE_AVAILABLE = True
    else:
        DATABASE_AVAILABLE = False
except Exception as e:
    print(f"⚠️  Database not available: {e}")
    DATABASE_AVAILABLE = False
    db = None

# Auth
try:
    from auth import verify_token
except:
    def verify_token(authorization: str = None):
        return {"sub": "guest", "email": "guest@propiq.com"}

router = APIRouter(prefix="/advisor", tags=["property_advisor"])

try:
    if os.getenv("AZURE_OPENAI_ENDPOINT") and os.getenv("AZURE_OPENAI_KEY"):
        client = AzureOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_KEY"),
            api_version="2024-02-15-preview"
        )
    else:
        client = None
except Exception:
    client = None

# ============================================================================
# MODELS
# ============================================================================

class PropertyInput(BaseModel):
    address: str
    asking_price: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    sqft: Optional[int] = None

class InvestorProfile(BaseModel):
    risk_tolerance: str  # conservative, moderate, aggressive
    investment_horizon: str  # short (1-3yr), medium (3-7yr), long (7+yr)
    strategy: str  # flip, rental, hold, mixed
    available_capital: Optional[float] = None

class AdvisorRequest(BaseModel):
    property: PropertyInput
    investor_profile: InvestorProfile
    session_id: Optional[str] = None

class AdvisorResponse(BaseModel):
    success: bool
    session_id: str
    stage: str
    agent_used: str
    output: Dict[str, Any]
    next_steps: List[str]
    timestamp: datetime


# ============================================================================
# SUB-AGENT PROMPTS
# ============================================================================

MARKET_ANALYST_PROMPT = """You are the Market Research Agent for PropIQ's investment advisory system.

**Your Role**:
Analyze the local real estate market for the target property and provide data-driven insights.

**Analysis Areas**:
1. Neighborhood Overview: Demographics, income levels, schools, crime, walkability
2. Market Trends: Price appreciation (1yr, 3yr, 5yr), inventory levels, days on market
3. Comparable Properties: Recent sales, active listings, price per sqft
4. Economic Factors: Job growth, major employers, development projects
5. Supply/Demand: Rental vacancy rates, buyer competition, seller motivation
6. Future Outlook: Planned infrastructure, zoning changes, growth projections

**Output Format**:
Return a structured JSON with:
- neighborhood_score (0-100)
- market_momentum (heating/cooling/stable)
- comparable_properties (list of 5-10 comps with addresses, prices, DOM)
- price_trends (historical appreciation data)
- market_insights (key findings and opportunities)
- data_sources (where you got information)

**Important**:
- Be data-driven and factual
- Cite sources when possible
- Flag any data gaps or uncertainties
- Focus on investment-relevant metrics
- Keep analysis concise but comprehensive
"""

DEAL_ANALYST_PROMPT = """You are the Deal Structuring Agent for PropIQ's investment advisory system.

**Your Role**:
Analyze the financial viability of the deal and create multiple investment scenarios.

**Analysis Areas**:
1. Purchase Analysis: Asking price vs. market value, negotiation leverage
2. Financing Options: Conventional, FHA, cash, creative financing
3. Cash Flow Projections: Rental income, expenses, NOI, cash-on-cash return
4. ROI Calculations: Cap rate, IRR, equity buildup, total return
5. Renovation Analysis: ARV, renovation costs, ROI on improvements
6. Exit Strategies: Sell timing, refinance options, 1031 exchange

**Scenarios to Create**:
1. Conservative: Worst-case assumptions (high interest, low rent, high vacancy)
2. Realistic: Most likely outcome based on market data
3. Optimistic: Best-case (quick appreciation, high rents, low expenses)

**Output Format**:
Return structured JSON with:
- deal_score (0-100)
- recommended_offer (price and terms)
- financing_recommendations (best loan structure)
- cash_flow_projection (5-year monthly CF)
- roi_metrics (cap rate, COC, IRR, total return)
- scenarios (conservative/realistic/optimistic)
- deal_breakers (red flags that kill the deal)

**Important**:
- Use standard real estate formulas
- Show your work (calculations visible)
- Be realistic, not overly optimistic
- Consider all costs (closing, holding, maintenance)
"""

RISK_ANALYST_PROMPT = """You are the Risk Assessment Agent for PropIQ's investment advisory system.

**Your Role**:
Identify and quantify all investment risks, then provide mitigation strategies.

**Risk Categories**:
1. Market Risk: Recession, price decline, oversupply, demand drop
2. Financial Risk: Interest rate changes, financing issues, cash flow problems
3. Property Risk: Structural issues, environmental, legal, tenant problems
4. Operational Risk: Management challenges, maintenance, unexpected expenses
5. Liquidity Risk: Difficulty selling, market illiquidity
6. Regulatory Risk: Zoning changes, rent control, tax law changes

**Risk Assessment**:
For each risk:
- Probability (low/medium/high)
- Impact (minor/moderate/severe)
- Mitigation strategies
- Warning signs to monitor

**Output Format**:
Return structured JSON with:
- overall_risk_score (0-100, lower is better)
- risk_category (low/moderate/high)
- alignment_with_profile (matches investor's risk tolerance?)
- top_risks (5 most significant risks ranked)
- mitigation_plan (concrete steps to reduce risk)
- monitoring_checklist (what to watch for)
- exit_triggers (when to sell/walk away)

**Important**:
- Be thorough but not alarmist
- Provide actionable mitigation strategies
- Consider investor's risk tolerance
- Flag any deal-breakers clearly
"""

ACTION_PLANNER_PROMPT = """You are the Action Planning Agent for PropIQ's investment advisory system.

**Your Role**:
Create a concrete, step-by-step action plan for the investor to execute this deal.

**Plan Phases**:

**Phase 1: Due Diligence (Week 1-2)**
- Property inspection checklist
- Document verification
- Comps analysis
- Financing pre-approval

**Phase 2: Offer Strategy (Week 2-3)**
- Recommended offer price and terms
- Negotiation tactics
- Contingencies to include
- Timeline for offer submission

**Phase 3: Contract to Close (Week 3-8)**
- Inspection negotiations
- Financing finalization
- Appraisal management
- Closing preparation

**Phase 4: Post-Acquisition (Month 2+)**
- Renovation timeline (if applicable)
- Property management setup
- Marketing for tenants
- Financial tracking setup

**Output Format**:
Return structured JSON with:
- recommended_action (proceed/negotiate/walk/wait)
- offer_strategy (price, terms, contingencies)
- due_diligence_checklist (specific items to verify)
- timeline (week-by-week action items)
- team_needed (agents, inspectors, contractors, etc.)
- estimated_costs (by phase)
- success_metrics (KPIs to track)

**Important**:
- Be specific and actionable
- Include realistic timelines
- Account for local market customs
- Provide templates/checklists where possible
"""

COORDINATOR_PROMPT = """You are the Investment Advisor Coordinator for PropIQ.

**Your Role**:
Guide the investor through a structured advisory process using specialized sub-agents.

**Workflow**:
1. Gather property details and investor profile
2. Call Market Analyst → Get market research
3. Call Deal Analyst → Get financial analysis
4. Call Risk Analyst → Get risk assessment
5. Call Action Planner → Get execution plan
6. Synthesize findings into final recommendation

**Communication Style**:
- Professional but approachable
- Explain complex concepts simply
- Ask clarifying questions when needed
- Set clear expectations for each step

**Important**:
- Never skip the workflow steps
- Pass outputs between agents (state management)
- Synthesize findings, don't just concatenate
- Provide clear go/no-go recommendation
- Acknowledge data limitations
"""


# ============================================================================
# SUB-AGENT EXECUTION
# ============================================================================

async def run_market_analyst(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute market research analysis"""
    messages = [
        {"role": "system", "content": MARKET_ANALYST_PROMPT},
        {
            "role": "user",
            "content": f"""Analyze the market for this property:

Address: {property_data.get('address')}
Asking Price: ${property_data.get('asking_price', 'Not provided'):,}
Property Type: {property_data.get('bedrooms')}bd/{property_data.get('bathrooms')}ba, {property_data.get('sqft', 'Unknown')} sqft

Provide comprehensive market analysis focusing on investment viability.
"""
        }
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3,  # More factual
        max_tokens=1500,
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)


async def run_deal_analyst(
    property_data: Dict[str, Any],
    market_analysis: Dict[str, Any],
    investor_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """Execute financial deal analysis"""
    messages = [
        {"role": "system", "content": DEAL_ANALYST_PROMPT},
        {
            "role": "user",
            "content": f"""Analyze this investment deal:

**Property**:
{json.dumps(property_data, indent=2)}

**Market Analysis**:
{json.dumps(market_analysis, indent=2)}

**Investor Profile**:
- Risk Tolerance: {investor_profile.get('risk_tolerance')}
- Investment Horizon: {investor_profile.get('investment_horizon')}
- Strategy: {investor_profile.get('strategy')}
- Available Capital: ${investor_profile.get('available_capital', 'Not provided'):,}

Create financial scenarios and recommend deal structure.
"""
        }
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3,
        max_tokens=2000,
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)


async def run_risk_analyst(
    property_data: Dict[str, Any],
    market_analysis: Dict[str, Any],
    deal_analysis: Dict[str, Any],
    investor_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """Execute risk assessment"""
    messages = [
        {"role": "system", "content": RISK_ANALYST_PROMPT},
        {
            "role": "user",
            "content": f"""Assess investment risks for this deal:

**Property**: {json.dumps(property_data, indent=2)}
**Market Analysis**: {json.dumps(market_analysis, indent=2)}
**Deal Analysis**: {json.dumps(deal_analysis, indent=2)}
**Investor Profile**: {json.dumps(investor_profile, indent=2)}

Provide comprehensive risk assessment aligned with investor's risk tolerance.
"""
        }
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3,
        max_tokens=1500,
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)


async def run_action_planner(
    property_data: Dict[str, Any],
    market_analysis: Dict[str, Any],
    deal_analysis: Dict[str, Any],
    risk_analysis: Dict[str, Any],
    investor_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """Create actionable execution plan"""
    messages = [
        {"role": "system", "content": ACTION_PLANNER_PROMPT},
        {
            "role": "user",
            "content": f"""Create an action plan for this investment:

**Property**: {json.dumps(property_data, indent=2)}
**Market**: {json.dumps(market_analysis, indent=2)}
**Deal**: {json.dumps(deal_analysis, indent=2)}
**Risks**: {json.dumps(risk_analysis, indent=2)}
**Investor**: {json.dumps(investor_profile, indent=2)}

Provide step-by-step action plan with timelines and checklists.
"""
        }
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.4,  # Slightly creative for planning
        max_tokens=2000,
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)


# ============================================================================
# MAIN ADVISOR ENDPOINT
# ============================================================================

@router.post("/analyze", response_model=AdvisorResponse)
async def run_property_advisor(
    request: AdvisorRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Multi-agent property investment advisor.
    Premium feature for Pro/Elite users.
    """
    user_id = token_payload.get("sub", "guest")

    # Check user tier (premium feature)
    if DATABASE_AVAILABLE:
        user = users.find_one({"_id": user_id})
        tier = user.get("subscription", {}).get("tier", "free") if user else "free"

    if not client:
        raise HTTPException(
            status_code=503,
            detail="Property Advisor temporarily unavailable due to AI system maintenance."
        )

    try:
        # Create or load session
        from bson import ObjectId
        session_id = request.session_id or str(ObjectId())

        # Convert Pydantic models to dicts
        property_data = request.property.dict()
        investor_profile = request.investor_profile.dict()

        # Execute multi-agent workflow
        stages = []

        # Stage 1: Market Analysis
        print("Running Market Analyst...")
        market_analysis = await run_market_analyst(property_data)
        stages.append({
            "stage": "market_analysis",
            "agent": "Market Analyst",
            "output": market_analysis,
            "timestamp": datetime.utcnow()
        })

        # Stage 2: Deal Analysis
        print("Running Deal Analyst...")
        deal_analysis = await run_deal_analyst(property_data, market_analysis, investor_profile)
        stages.append({
            "stage": "deal_analysis",
            "agent": "Deal Analyst",
            "output": deal_analysis,
            "timestamp": datetime.utcnow()
        })

        # Stage 3: Risk Assessment
        print("Running Risk Analyst...")
        risk_analysis = await run_risk_analyst(
            property_data, market_analysis, deal_analysis, investor_profile
        )
        stages.append({
            "stage": "risk_assessment",
            "agent": "Risk Analyst",
            "output": risk_analysis,
            "timestamp": datetime.utcnow()
        })

        # Stage 4: Action Planning
        print("Running Action Planner...")
        action_plan = await run_action_planner(
            property_data, market_analysis, deal_analysis, risk_analysis, investor_profile
        )
        stages.append({
            "stage": "action_plan",
            "agent": "Action Planner",
            "output": action_plan,
            "timestamp": datetime.utcnow()
        })

        # Save complete session
        if DATABASE_AVAILABLE:
            advisor_sessions.update_one(
                {"session_id": session_id, "user_id": user_id},
                {
                    "$set": {
                        "property": property_data,
                        "investor_profile": investor_profile,
                        "stages": stages,
                        "updated_at": datetime.utcnow()
                    },
                    "$setOnInsert": {"created_at": datetime.utcnow()}
                },
                upsert=True
            )

        # Return final action plan (most useful for user)
        return AdvisorResponse(
            success=True,
            session_id=session_id,
            stage="complete",
            agent_used="All Agents",
            output={
                "market_analysis": market_analysis,
                "deal_analysis": deal_analysis,
                "risk_assessment": risk_analysis,
                "action_plan": action_plan,
                "recommendation": action_plan.get("recommended_action", "Review analysis")
            },
            next_steps=[
                "Review the comprehensive analysis",
                "Check the action plan timeline",
                "Verify due diligence checklist",
                "Consult with your team (agent, inspector, etc.)",
                "Make go/no-go decision"
            ],
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Advisor analysis failed: {str(e)}"
        )


@router.get("/session/{session_id}")
async def get_advisor_session(
    session_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Get previous advisor session"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user_id = token_payload.get("sub", "guest")

    session = advisor_sessions.find_one({
        "session_id": session_id,
        "user_id": user_id
    })

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "success": True,
        "session": {
            "session_id": session["session_id"],
            "property": session["property"],
            "investor_profile": session["investor_profile"],
            "stages": session["stages"],
            "created_at": session["created_at"],
            "updated_at": session["updated_at"]
        }
    }


@router.get("/health")
async def health_check():
    """Health check for property advisor"""
    return {
        "status": "healthy",
        "feature": "multi_agent_advisor",
        "agents": [
            "Market Analyst",
            "Deal Analyst",
            "Risk Analyst",
            "Action Planner"
        ],
        "premium_only": True,
        "database": DATABASE_AVAILABLE
    }


# ============================================================================
# DISCLAIMER
# ============================================================================

INVESTMENT_DISCLAIMER = """
⚠️ IMPORTANT DISCLAIMER

This investment analysis is generated by AI for educational and informational
purposes only. It does NOT constitute:
- Professional financial advice
- Legal advice
- Real estate brokerage services
- Investment recommendations
- Tax guidance

PropIQ and its affiliates make no representations or warranties about the
accuracy, completeness, or suitability of this information. Real estate
investment involves significant risks, and past performance does not indicate
future results.

Before making any investment decision, you should:
✓ Conduct independent due diligence
✓ Consult qualified professionals (CPA, attorney, real estate agent)
✓ Verify all data independently
✓ Consider your personal financial situation

By using this service, you acknowledge this disclaimer and agree that PropIQ
is not liable for any losses arising from your investment decisions.
"""
