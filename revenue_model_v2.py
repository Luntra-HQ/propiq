
import math

def calculate_distribution_impact():
    # Pricing
    PRICE_FREE = 0
    PRICE_PRO = 79
    PRICE_ELITE = 199
    
    # Scenarios (Percentages as decimals)
    # A: Consumer Heavy (70% Free, 20% Pro, 10% Elite)
    dist_a = {'Free': 0.70, 'Pro': 0.20, 'Elite': 0.10}
    
    # B: Balanced / B2B (40% Free, 40% Pro, 20% Elite)
    dist_b = {'Free': 0.40, 'Pro': 0.40, 'Elite': 0.20}
    
    distributions = {'A (Consumer Heavy)': dist_a, 'B (Balanced B2B)': dist_b}
    
    mrr_targets = [2500, 7500, 15000, 30000]
    quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    
    print("## 1. Pricing Tier Impact & User Counts")
    print(f"Prices: Free ${PRICE_FREE}, Pro ${PRICE_PRO}, Elite ${PRICE_ELITE}\n")

    for name, dist in distributions.items():
        # Calculate Blended ARPU (Total User Base)
        arpu_total = (dist['Free'] * PRICE_FREE) + (dist['Pro'] * PRICE_PRO) + (dist['Elite'] * PRICE_ELITE)
        
        # Calculate Blended ARPU (Paying Users Only) - Normalize the paying portion to 100%
        paying_share = dist['Pro'] + dist['Elite']
        arpu_paying = ((dist['Pro'] * PRICE_PRO) + (dist['Elite'] * PRICE_ELITE)) / paying_share
        
        print(f"### Scenario {name}")
        print(f"**Blended ARPU (Total)**: ${arpu_total:.2f}")
        print(f"**Blended ARPU (Paying Only)**: ${arpu_paying:.2f}")
        print(f"**Paying User %**: {paying_share:.0%}\n")
        
        print("| Target (MRR) | Total Users Needed | Paying Users Needed | Breakdown (Pro / Elite) |")
        print("| :--- | :--- | :--- | :--- |")
        
        for q, target in zip(quarters, mrr_targets):
            total_users = math.ceil(target / arpu_total)
            paying_users = math.ceil(total_users * paying_share)
            pro_users = math.ceil(total_users * dist['Pro'])
            elite_users = math.ceil(total_users * dist['Elite'])
            
            print(f"| **{q}** ${target:,} | {total_users:,} | {paying_users:,} | {pro_users:,} Pro / {elite_users:,} Elite |")
        print("\n")

def calculate_market_sensitivity():
    # Baseline: 3% Conversion from Visitor to Free User -> Paid User is modeled differently usually.
    # Let's simplify: conversion rate from "Traffic/Free" to "Paid".
    # Assume we need X Paying Users (from previous step for Q4 $30k).
    # Scenario A (Consumer Heavy) Paying ARPU ~$119. Q4 Target $30,000.
    # Required Paying Users = 30000 / 119 = 252.
    
    print("## 2. Market Sensitivity (Discretionary Risk)")
    print("Scenario: Aiming for **Q4 ($30k MRR)** under Scenario A (Consumer Heavy).")
    print("Required Paying Users: ~252 usage.\n")
    
    # Baseline assumptions
    base_conversion_rate = 0.05 # 5% of Free users upgrade to Paid (example baseline)
    
    impacts = [
        ("Baseline (5%)", 0.05),
        ("Soft Market (-25% Conv, 3.75%)", 0.05 * 0.75),
        ("Recession (-50% Conv, 2.5%)", 0.05 * 0.50)
    ]
    
    print("| Scenario | Conversion Rate (Free->Paid) | Paying Users Needed | Free User Pool Needed (Leads) | Change in Effort |")
    print("| :--- | :--- | :--- | :--- | :--- |")
    
    target_paying = 252
    base_free_needed = target_paying / 0.05
    
    for label, rate in impacts:
        free_needed = math.ceil(target_paying / rate)
        effort_mult = free_needed / base_free_needed
        print(f"| {label} | {rate:.2%} | {target_paying} | {free_needed:,} | **{effort_mult:.1f}x** Traffic |")
        
    print("\n> [!CAUTION]")
    print("> **Funnel Risk**: If conversion drops by half (2.5%), you need **double** the leads (10k+ free users) to hit the same revenue goal. Monitoring conversion weekly is critical.\n")

def calculate_break_even_resilience():
    fixed_costs = 3000
    
    # Paying ARPU from Scenario A (Consumer): $119
    # Paying ARPU from Scenario B (B2B): ~ (0.4*79 + 0.2*199)/0.6 = (31.6 + 39.8)/0.6 = 119... Wait.
    # Let's re-calc B2B Paying ARPU exactly: Pro(79)*2 + Elite(199)*1 mix (40/20 ratio -> 2:1).
    # (79*2 + 199)/3 = (158+199)/3 = 357/3 = $119.
    # ARPU is surprisingly stable across these specific mixes because the ratio of Pro:Elite is 2:1 in both (20:10 and 40:20).
    arpu_paying = 119 
    
    print("## 3. Break-Even Resilience")
    print(f"Fixed Operating Costs: ${fixed_costs:,}/mo")
    print(f"Avg Revenue Per Paying User: ~${arpu_paying}")
    
    break_even_users = math.ceil(fixed_costs / arpu_paying)
    
    print(f"\n**Base Break-Even**: You need **{break_even_users} paying users** to cover ops costs.\n")
    
    print("### Churn Impact on 'Running to Stand Still'")
    print("If you are exactly at break-even (26 users), how many do you lose per month?\n")
    
    churn_rates = [0.05, 0.10, 0.15]
    print("| Monthly Churn | Users Lost/Mo | Replacement Sales Needed/Mo | Annualized Loss Risk |")
    print("| :--- | :--- | :--- | :--- |")
    
    for churn in churn_rates:
        lost = math.ceil(break_even_users * churn) # Round up to whole human
        # actually partial humans matter in aggregates but for small numbers...
        # Let's show decimal for clarity
        lost_exact = break_even_users * churn
        
        print(f"| {churn:.0%} | {lost_exact:.1f} | ~{math.ceil(lost_exact)} new users | -{lost_exact*12:.0f} users/year |")

    print("\n*At this price point, volume is low, so '1 user' is a significant percentage of revenue. Losing 3-4 users (15% churn) puts you immediately back in the red.*")

if __name__ == "__main__":
    print("# Prop IQ Revenue Strategy Refinement (Phase 2)\n")
    calculate_distribution_impact()
    calculate_market_sensitivity()
    calculate_break_even_resilience()
