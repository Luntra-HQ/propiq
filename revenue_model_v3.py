import math

class InfrastructureCost:
    def __init__(self, mode="growth"):
        self.mode = mode
        
        # Monthly Fixed Costs (USD)
        self.costs = {
            "lean": {
                "frontend_hosting": 0,    # Netlify Starter
                "backend_hosting": 28,    # AWS App Runner (0.5 vCPU, 1GB)
                "database": 0,            # Supabase Free
                "backend_logic": 0,       # Convex Free
                "monitoring": 0,          # Sentry Dev
                "email_marketing": 0,     # Removed - using Resend instead
                "support": 0,             # Removed - Intercom cancelled April 2026
            },
            "growth": {
                "frontend_hosting": 19,   # Netlify Pro
                "backend_hosting": 56,    # AWS App Runner (1 vCPU, 2GB, auto-scaling)
                "database": 25,           # Supabase Pro
                "backend_logic": 25,      # Convex Pro
                "monitoring": 26,         # Sentry Team
                "email_marketing": 15,    # Removed - using Resend instead
                "support": 39,            # Removed - Intercom cancelled April 2026
            }
        }
    
    def get_total_fixed_cost(self):
        return sum(self.costs[self.mode].values())

    def print_breakdown(self):
        print(f"\n## 1. Fixed Infrastructure Costs ({self.mode.title()} Mode)")
        total = 0
        print("| Component | Service | Cost/Mo |")
        print("| :--- | :--- | :--- |")
        for key, value in self.costs[self.mode].items():
            print(f"| {key.replace('_', ' ').title()} | - | ${value} |")
            total += value
        print(f"| **Total** | | **${total}** |")
        return total

class UnitEconomics:
    def __init__(self):
        # Variable Costs per Unit (Analysis)
        # LLM: Updated - using Anthropic API April 2026 - approx $0.25/$1.25 per 1M tokens
        self.costs = {
            "llm_input": 0.00025 * 2,   # ~$0.25/1M tokens, ~2k tokens/analysis
            "llm_output": 0.00125 * 1,   # ~$1.25/1M tokens, ~1k tokens/analysis
            "serp_api": 0.01, # Assumes we cache heavily, so only 1 in 50 analyses needs a fresh $0.01 call? Or higher? 
                              # Actually SerpAPI is pricey ($50/5k searches = $0.01/search). Let's assume 1 search per analysis.
            "email_transactional": 0.0004, # Resend $20/50k = $0.0004
            "storage": 0.001 # AWS S3 nominal alloc per user
        }
        
    def get_cost_per_analysis(self):
        # AI cost calculation
        ai_cost = self.costs["llm_input"] + self.costs["llm_output"]
        other_cost = self.costs["serp_api"] + self.costs["email_transactional"] + self.costs["storage"]
        return ai_cost + other_cost

    def print_breakdown(self):
        cpa = self.get_cost_per_analysis()
        print(f"\n## 2. Unit Economics (Variable Costs)")
        print(f"**Cost Per Analysis**: ${cpa:.4f}")
        print("*This includes AI tokens, Search API calls, and email delivery.*")
        return cpa

def calculate_break_even():
    infra_lean = InfrastructureCost("lean")
    infra_growth = InfrastructureCost("growth")
    
    unit_econ = UnitEconomics()
    cpa = unit_econ.get_cost_per_analysis()
    
    # Revenue Assumptions
    arpu = 22.50 # Blended Average Revenue Per User
    users_per_month_analyses = 10 # Avg analyses per user per month
    
    cost_to_serve_user = cpa * users_per_month_analyses
    gross_margin_per_user = arpu - cost_to_serve_user
    
    # Payment Processing
    stripe_fee_pct = 0.029
    stripe_fixed = 0.30
    net_revenue_per_user = (arpu * (1 - stripe_fee_pct)) - stripe_fixed
    
    contribution_margin = net_revenue_per_user - cost_to_serve_user
    
    print("\n## 3. Profitability & Break-Even Analysis")
    print(f"**Assumptions**:")
    print(f"- ARPU: ${arpu:.2f}")
    print(f"- Analyses/User/Mo: {users_per_month_analyses}")
    print(f"- Cost to Serve User: ${cost_to_serve_user:.2f}/mo")
    print(f"- Net Contribution Margin: ${contribution_margin:.2f}/user/mo")
    
    fixed_cost_lean = infra_lean.get_total_fixed_cost()
    fixed_cost_growth = infra_growth.get_total_fixed_cost()
    
    be_lean = fixed_cost_lean / contribution_margin if contribution_margin > 0 else 999999
    be_growth = fixed_cost_growth / contribution_margin if contribution_margin > 0 else 999999
    
    import math
    be_lean = math.ceil(be_lean)
    be_growth = math.ceil(be_growth)
    
    print(f"\n### Break-Even Targets")
    print(f"| Scenario | Fixed Cost | Break-Even Users |")
    print(f"| :--- | :--- | :--- |")
    print(f"| **Lean (Dev)** | ${fixed_cost_lean}/mo | **{be_lean} users** |")
    print(f"| **Growth (Pro)** | ${fixed_cost_growth}/mo | **{be_growth} users** |")
    
    print("\n> [!TIP]")
    print(f"> You only need **{be_growth} paying users** to cover your entire professional infrastructure stack.")

if __name__ == "__main__":
    print("# Prop IQ Cost & Profitability Model")
    
    # Run calculations
    i = InfrastructureCost("growth")
    i.print_breakdown()
    
    u = UnitEconomics()
    u.print_breakdown()
    
    calculate_break_even()
