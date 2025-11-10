#!/usr/bin/env python3
"""
Create Test Users for PropIQ Simulation
========================================
Creates 5 simulated users in Supabase for power user simulation testing.

Usage:
    python3 create_test_users.py
"""

import sys
import os

# Add parent directory to path to import database_supabase
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database_supabase import create_user

# Test user definitions
TEST_USERS = [
    {
        'email': 'will.weekend@simulated.propiq.com',
        'password': 'SimTest2025!',
        'full_name': 'Will Weekend',
        'tier': 'free'
    },
    {
        'email': 'paula.portfolio@simulated.propiq.com',
        'password': 'SimPaula2025!Elite',
        'full_name': 'Paula Portfolio',
        'tier': 'pro'  # Will upgrade to elite during simulation
    },
    {
        'email': 'frank.firsttime@simulated.propiq.com',
        'password': 'SimFrank2025!Start',
        'full_name': 'Frank Firsttime',
        'tier': 'free'  # Will upgrade to starter during simulation
    },
    {
        'email': 'rita.realtor@simulated.propiq.com',
        'password': 'SimRita2025!Pro',
        'full_name': 'Rita Realtor',
        'tier': 'pro'
    },
    {
        'email': 'ben.bizdev@simulated.propiq.com',
        'password': 'SimBen2025!BizPro',
        'full_name': 'Ben Bizdev',
        'tier': 'pro'
    }
]

def main():
    """Create all test users"""
    print("="*80)
    print("Creating PropIQ Simulation Test Users")
    print("="*80)
    print()

    created = []
    already_exists = []
    errors = []

    for user_data in TEST_USERS:
        email = user_data['email']
        try:
            user = create_user(
                email=email,
                password=user_data['password'],
                full_name=user_data['full_name']
            )
            created.append(email)
            print(f"✅ Created: {email}")

        except Exception as e:
            error_msg = str(e)
            if 'already exists' in error_msg.lower():
                already_exists.append(email)
                print(f"⚠️  Already exists: {email}")
            else:
                errors.append((email, error_msg))
                print(f"❌ Failed: {email} - {error_msg}")

    # Summary
    print()
    print("="*80)
    print("Summary")
    print("="*80)
    print(f"Created:         {len(created)}")
    print(f"Already existed: {len(already_exists)}")
    print(f"Errors:          {len(errors)}")
    print()

    if created:
        print("✅ Newly created users:")
        for email in created:
            print(f"   - {email}")
        print()

    if already_exists:
        print("⚠️  Users that already existed:")
        for email in already_exists:
            print(f"   - {email}")
        print()

    if errors:
        print("❌ Errors:")
        for email, error in errors:
            print(f"   - {email}: {error}")
        print()

    # Final status
    total_ready = len(created) + len(already_exists)
    if total_ready == len(TEST_USERS):
        print("="*80)
        print("✅ ALL TEST USERS READY FOR SIMULATION")
        print("="*80)
        print()
        print("Next step: Run the simulation")
        print("  cd /Users/briandusape/Projects/LUNTRA/LUNTRA\\ MVPS/propiq/backend/simulations")
        print("  python3 simulation_runner.py")
        print()
        return 0
    else:
        print("="*80)
        print(f"⚠️  {len(errors)} USERS FAILED TO CREATE")
        print("="*80)
        print()
        print("Please resolve errors above before running simulation")
        print()
        return 1

if __name__ == "__main__":
    sys.exit(main())
