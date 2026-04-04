
import math

def calculate_customer_counts():
    mrr_targets = {
        "Q1": 2500,
        "Q2": 7500,
        "Q3": 15000,
        "Q4": 30000
    }
    tiers = [10, 25, 50]
    blended_arpu = (0.5 * 10) + (0.3 * 25) + (0.2 * 50) # $22.50

    print("## 1. Customer Count Estimates")
    print("How many paying users needed to hit MRR targets:")
    print("| Quarter | MRR Goal | @ $10/mo | @ $25/mo | @ $50/mo | @ Blended ($22.50) |")
    print("| :--- | :--- | :--- | :--- | :--- | :--- |")

    for q, target in mrr_targets.items():
        c_10 = int(math.ceil(target / 10))
        c_25 = int(math.ceil(target / 25))
        c_50 = int(math.ceil(target / 50))
        c_blended = int(math.ceil(target / blended_arpu))
        print(f"| {q} | ${target:,} | {c_10:,} | {c_25:,} | {c_50:,} | {c_blended:,} |")
    print("\n*Blended assumptions: 50% ($10), 30% ($25), 20% ($50)*\n")

def calculate_growth_rates():
    # MRR Targets for end of Q1, Q2, Q3, Q4. Months: 3, 6, 9, 12
    targets = [(3, 2500), (6, 7500), (9, 15000), (12, 30000)]
    
    # Scene 1: Start from "Zero" (Nominal $100 to avoid div/0, representing maybe 4-5 early users)
    start_zero_mrr = 100 
    
    # Scene 2: Start from 100 users (Blended ARPU $22.50)
    start_100_users_mrr = 100 * 22.5
    
    print("## 2. Monthly Growth Rates Needed (CMGR)")
    print("| Period | Target MRR (End of Period) | Start from Scratch (est $100 MRR) | Start from 100 Users (~$2,250 MRR) |")
    print("| :--- | :--- | :--- | :--- |")

    prev_months_zero = 0
    prev_mrr_zero = start_zero_mrr
    
    prev_months_100 = 0
    prev_mrr_100 = start_100_users_mrr

    for months, target in targets:
        # Zero Scenario
        n_months_zero = months - prev_months_zero
        cmgr_zero = (target / prev_mrr_zero) ** (1/n_months_zero) - 1
        
        # 100 User Scenario
        n_months_100 = months - prev_months_100
        cmgr_100 = (target / prev_mrr_100) ** (1/n_months_100) - 1
        
        print(f"| End of Q{months//3} | ${target:,} | {cmgr_zero:.1%} monthly | {cmgr_100:.1%} monthly |")

        # Update previous for next interval logic (rolling calculation)
        # Actually user might want rate from TODAY to QX, or interval to interval.
        # Usually interval-to-interval is more actionable (what do I need to do NOW vs in Q3)
        prev_months_zero = months
        prev_mrr_zero = target
        prev_months_100 = months
        prev_mrr_100 = target

    print("\n*Note: 'Start from Scratch' assumes a nominal $100 MRR start to calculate percentage.*")
    print("*Note: Growth rates shown are the monthly compounded rates needed to get from the previous milestone to the current one.*\n")

def calculate_churn_impact():
    # Model Q4 run (0 to 30,000 over 12 months) with constant linear MRR add requirement vs churn
    # Actually, let's keep it simple: To maintain the growth path derived above (Start Zero -> Q4 $30k), what is the NET vs GROSS add?
    
    # Let's simplify: Just look at the Q4 goal ($30,000). 
    # If we are at $15,000 (Q3) and need to get to $30,000 (Q4) in 3 months.
    # Start: $15,000. End: $30,000. 
    # Base Growth needed: ~$5k/mo net add.
    
    print("## 3. Churn Impact Analysis (Focus on Q3 -> Q4 Growth)")
    print("Scenario: Growing from $15,000 (Q3) to $30,000 (Q4) in 3 months.")
    print("Net New MRR Needed: +$5,000/month (avg).\n")
    
    churn_rates = [0.05, 0.10, 0.15]
    
    print("| Monthly Churn | churn $ (at $15k base) | New Sales Needed (First Month) | New Sales Needed (By Month 3 @ ~25k) |")
    print("| :--- | :--- | :--- | :--- |")
    
    for churn in churn_rates:
        churn_start = 15000 * churn
        churn_end = 25000 * churn # approx avg base in month 3
        
        # Determine gross needed to hit net +5000
        gross_start = 5000 + churn_start
        gross_end = 5000 + churn_end
        
        print(f"| {churn:.0%} | ${churn_start:,.0f} | ${gross_start:,.0f} | ${gross_end:,.0f} |")
        
    print("\n> [!WARNING]")
    print("> **Red Flag**: At 15% churn, you need to sell almost **double** your growth target just to stay on track. 5% is a standard 'healthy' limit for B2B SaaS.\n")

def calculate_break_even():
    fixed_costs = 3000
    mrr_targets = {
        "Q1": 2500,
        "Q2": 7500,
        "Q3": 15000,
        "Q4": 30000
    }
    
    print("## 4. Operational Sustainability (Break-Even)")
    print(f"Fixed Costs: ${fixed_costs:,}/mo\n")
    
    previous_q = "Start"
    previous_amount = 0
    
    for q, amount in mrr_targets.items():
        if amount >= fixed_costs and previous_amount < fixed_costs:
            print(f"**Break-Even Point**: Achieved between {previous_q} and {q}.")
            # Interpolate
            gap_total = amount - previous_amount
            gap_needed = fixed_costs - previous_amount
            fraction = gap_needed / gap_total if gap_total > 0 else 0
            month_offset = int(fraction * 3)
            print(f"- Specifically, around Month {month_offset + (3 if q=='Q2' else 0)} of the year.")
            print(f"- At Q{1 if q=='Q1' else 2} exit, you are profitable by ${amount - fixed_costs:,}/mo.")
            break
        previous_q = q
        previous_amount = amount

if __name__ == "__main__":
    print("# Prop IQ 2026 Revenue Modeling Report\n")
    calculate_customer_counts()
    calculate_growth_rates()
    calculate_churn_impact()
    calculate_break_even()
