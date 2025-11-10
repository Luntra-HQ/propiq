#!/usr/bin/env python3
"""
Delete Old Test Users (.test domains)
======================================
Removes the old simulation test users that use .test domains before creating new ones with .com domains.

Usage:
    python3 delete_old_test_users.py
"""

import sys
import os

# Add parent directory to path to import database_supabase
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database_supabase import supabase

# Old test user emails to delete (with .test domains)
OLD_TEST_EMAILS = [
    'will.weekend@simulated.propiq.test',
    'paula.portfolio@simulated.propiq.test',
    'frank.firsttime@simulated.propiq.test',
    'rita.realtor@simulated.propiq.test',
    'ben.bizdev@simulated.propiq.test'
]

def main():
    """Delete all old test users"""
    print("="*80)
    print("Deleting Old PropIQ Simulation Test Users (.test domains)")
    print("="*80)
    print()
    print("⚠️  WARNING: This will permanently delete the following users:")
    for email in OLD_TEST_EMAILS:
        print(f"   - {email}")
    print()

    # Confirm deletion
    response = input("Are you sure you want to delete these users? (yes/no): ")
    if response.lower() != 'yes':
        print("Deletion cancelled.")
        return 0

    print()
    deleted = []
    not_found = []
    errors = []

    for email in OLD_TEST_EMAILS:
        try:
            # Delete user from Supabase
            result = supabase.table('users').delete().eq('email', email).execute()

            if result.data:
                deleted.append(email)
                print(f"✅ Deleted: {email}")
            else:
                not_found.append(email)
                print(f"⚠️  Not found: {email}")

        except Exception as e:
            error_msg = str(e)
            errors.append((email, error_msg))
            print(f"❌ Failed to delete: {email} - {error_msg}")

    # Summary
    print()
    print("="*80)
    print("Summary")
    print("="*80)
    print(f"Deleted:   {len(deleted)}")
    print(f"Not found: {len(not_found)}")
    print(f"Errors:    {len(errors)}")
    print()

    if deleted:
        print("✅ Deleted users:")
        for email in deleted:
            print(f"   - {email}")
        print()

    if not_found:
        print("⚠️  Users that didn't exist:")
        for email in not_found:
            print(f"   - {email}")
        print()

    if errors:
        print("❌ Errors:")
        for email, error in errors:
            print(f"   - {email}: {error}")
        print()

    # Final status
    if len(deleted) + len(not_found) == len(OLD_TEST_EMAILS):
        print("="*80)
        print("✅ OLD TEST USERS CLEANED UP")
        print("="*80)
        print()
        print("Next step: Create new test users with .com domains")
        print("  python3 create_test_users.py")
        print()
        return 0
    else:
        print("="*80)
        print(f"⚠️  {len(errors)} USERS FAILED TO DELETE")
        print("="*80)
        print()
        print("Please resolve errors above before creating new users")
        print()
        return 1

if __name__ == "__main__":
    sys.exit(main())
