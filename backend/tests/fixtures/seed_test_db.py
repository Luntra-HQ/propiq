"""
Seed test database with initial data for integration tests

Usage:
    python tests/fixtures/seed_test_db.py           # Seed test data
    python tests/fixtures/seed_test_db.py --clear   # Clear all test data
    python tests/fixtures/seed_test_db.py --reset   # Clear and re-seed
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import bcrypt

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Load test environment
env_path = Path(__file__).parent.parent.parent / '.env.test'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment from {env_path}")
else:
    print(f"⚠️  .env.test not found at {env_path}")
    print("   Using system environment variables")

try:
    from supabase import create_client
except ImportError:
    print("❌ supabase-py not installed")
    print("   Install with: pip install supabase")
    sys.exit(1)


def get_supabase_client():
    """Create Supabase client from environment variables"""
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_KEY')

    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
        print("   Set them in .env.test or environment")
        sys.exit(1)

    # Safety check: ensure we're not using production
    if 'prod' in url.lower() or 'production' in url.lower():
        print("❌ DANGER: Test script is configured with production database!")
        print("   URL:", url)
        sys.exit(1)

    return create_client(url, key)


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def seed_users(supabase):
    """Create test users"""
    print("\n📝 Seeding users...")

    users = [
        {
            "email": "test@propiq.test",
            "password_hash": hash_password("TestPass123"),
            "first_name": "Test",
            "last_name": "User",
            "company": "Test Company",
            "subscription_tier": "free",
            "analyses_used": 0,
            "analyses_limit": 3,
            "is_active": True
        },
        {
            "email": "pro@propiq.test",
            "password_hash": hash_password("ProPass123"),
            "first_name": "Pro",
            "last_name": "User",
            "company": "Pro Company",
            "subscription_tier": "pro",
            "analyses_used": 10,
            "analyses_limit": 100,
            "stripe_customer_id": "cus_test_pro_user",
            "is_active": True
        },
        {
            "email": "elite@propiq.test",
            "password_hash": hash_password("ElitePass123"),
            "first_name": "Elite",
            "last_name": "User",
            "company": "Elite Company",
            "subscription_tier": "elite",
            "analyses_used": 50,
            "analyses_limit": 999999,  # Unlimited
            "stripe_customer_id": "cus_test_elite_user",
            "is_active": True
        },
        {
            "email": "inactive@propiq.test",
            "password_hash": hash_password("InactivePass123"),
            "first_name": "Inactive",
            "last_name": "User",
            "subscription_tier": "free",
            "analyses_used": 0,
            "analyses_limit": 3,
            "is_active": False
        }
    ]

    created_count = 0
    for user in users:
        try:
            result = supabase.table('users').insert(user).execute()
            print(f"  ✅ Created user: {user['email']} ({user['subscription_tier']})")
            created_count += 1
        except Exception as e:
            error_str = str(e).lower()
            if 'duplicate' in error_str or 'unique' in error_str:
                print(f"  ⚠️  User {user['email']} already exists")
            else:
                print(f"  ❌ Error creating {user['email']}: {e}")

    print(f"\n✅ Created {created_count} users")
    return created_count


def seed_property_analyses(supabase):
    """Create sample property analyses"""
    print("\n📝 Seeding property analyses...")

    # Get test user ID
    try:
        user_result = supabase.table('users').select('id').eq('email', 'test@propiq.test').execute()
        if not user_result.data:
            print("  ⚠️  Test user not found, skipping property analyses")
            return 0

        user_id = user_result.data[0]['id']
    except Exception as e:
        print(f"  ⚠️  Could not get test user: {e}")
        return 0

    analyses = [
        {
            "user_id": user_id,
            "address": "123 Main St, San Francisco, CA 94102",
            "analysis_data": {
                "purchase_price": 800000,
                "monthly_rent": 4500,
                "cash_flow": -928.98,
                "cap_rate": 4.2,
                "roi": -3.97
            },
            "score": 42,
            "rating": "Poor"
        },
        {
            "user_id": user_id,
            "address": "456 Oak Ave, Austin, TX 78701",
            "analysis_data": {
                "purchase_price": 450000,
                "monthly_rent": 3200,
                "cash_flow": 325.50,
                "cap_rate": 6.8,
                "roi": 4.5
            },
            "score": 72,
            "rating": "Good"
        }
    ]

    created_count = 0
    for analysis in analyses:
        try:
            result = supabase.table('property_analyses').insert(analysis).execute()
            print(f"  ✅ Created analysis: {analysis['address']} (score: {analysis['score']})")
            created_count += 1
        except Exception as e:
            print(f"  ❌ Error creating analysis: {e}")

    print(f"\n✅ Created {created_count} property analyses")
    return created_count


def clear_test_data(supabase):
    """Clear all test data from tables"""
    print("\n🗑️  Clearing test data...")

    tables = ['support_chats', 'property_analyses', 'users']
    cleared_count = 0

    for table in tables:
        try:
            # Delete all rows except impossible UUID (to trigger delete all)
            result = supabase.table(table).delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
            count = len(result.data) if result.data else 0
            print(f"  ✅ Cleared {count} rows from {table}")
            cleared_count += count
        except Exception as e:
            print(f"  ⚠️  Error clearing {table}: {e}")

    print(f"\n✅ Cleared {cleared_count} total rows")
    return cleared_count


def verify_setup(supabase):
    """Verify database setup and tables exist"""
    print("\n🔍 Verifying database setup...")

    tables = ['users', 'property_analyses', 'support_chats']
    verified = True

    for table in tables:
        try:
            result = supabase.table(table).select('count').execute()
            count = len(result.data) if result.data else 0
            print(f"  ✅ Table '{table}' exists ({count} rows)")
        except Exception as e:
            print(f"  ❌ Table '{table}' error: {e}")
            verified = False

    return verified


def print_test_credentials():
    """Print test user credentials for reference"""
    print("\n" + "="*60)
    print("TEST USER CREDENTIALS")
    print("="*60)
    print("\n📧 Free Tier User:")
    print("   Email:    test@propiq.test")
    print("   Password: TestPass123")
    print("   Limit:    3 analyses")
    print("\n📧 Pro Tier User:")
    print("   Email:    pro@propiq.test")
    print("   Password: ProPass123")
    print("   Limit:    100 analyses")
    print("\n📧 Elite Tier User:")
    print("   Email:    elite@propiq.test")
    print("   Password: ElitePass123")
    print("   Limit:    Unlimited")
    print("\n📧 Inactive User:")
    print("   Email:    inactive@propiq.test")
    print("   Password: InactivePass123")
    print("   Status:   Disabled (for testing)")
    print("\n" + "="*60)


def main():
    """Main execution"""
    print("\n" + "="*60)
    print("PropIQ Test Database Seeder")
    print("="*60)

    # Get command line arguments
    command = sys.argv[1] if len(sys.argv) > 1 else None

    # Create Supabase client
    supabase = get_supabase_client()
    print("✅ Connected to Supabase")

    # Verify database setup
    if not verify_setup(supabase):
        print("\n❌ Database verification failed!")
        print("   Make sure tables are created. See TEST_DATABASE_SETUP.md")
        sys.exit(1)

    # Execute command
    if command == "--clear":
        clear_test_data(supabase)
        print("\n✅ Test data cleared!")

    elif command == "--reset":
        clear_test_data(supabase)
        print()
        seed_users(supabase)
        seed_property_analyses(supabase)
        print_test_credentials()
        print("\n✅ Test database reset complete!")

    else:
        # Default: seed data
        seed_users(supabase)
        seed_property_analyses(supabase)
        print_test_credentials()
        print("\n✅ Test database seeded successfully!")

    print("\n📝 Run tests with:")
    print("   cd backend")
    print("   pytest tests/integration/ -v")
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
