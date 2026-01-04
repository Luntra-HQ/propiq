#!/usr/bin/env python3
"""
Clean PropIQ user data - identify test accounts, personal emails, and real users
"""

import json
import re
from collections import defaultdict

# Load all user data
with open('/tmp/segment2_never_used.json', 'r') as f:
    never_used = json.load(f)

with open('/tmp/segment1_upgrade_intent.json', 'r') as f:
    upgrade_intent = json.load(f)

with open('/tmp/segment3_used_no_upgrade.json', 'r') as f:
    used_no_upgrade = json.load(f)

# Combine all users (get unique list)
all_users = {}
for segment in [never_used, upgrade_intent, used_no_upgrade]:
    for user in segment.get('users', []):
        email = user.get('email', '')
        if email not in all_users:
            all_users[email] = user

print("=" * 80)
print("PROPIQ USER DATA CLEANUP REPORT")
print("=" * 80)
print()
print(f"Total unique users: {len(all_users)}")
print()

# Categories
test_accounts = []
personal_accounts = []
friend_accounts = []
real_users = []
suspicious = []

# Known personal email patterns
personal_emails = [
    'bdusape@gmail.com',
    'bdusape@luntra.one',
    'briandphive@gmail.com',
    'b.dusape@outlook.com',
    'infodiamonddusape@gmail.com',
]

# Test account patterns
test_patterns = [
    r'test[+@-]',
    r'rapid-test',
    r'chaos-test',
    r'tour-test',
    r'tour-verify',
    r'free-tier',
    r'@propiq\.test',
    r'@test\.com',
    r'@example\.com',
]

# Known friends/colleagues (add names you recognize)
known_friends = [
    'keanulamarre@gmail.com',  # Keanu Lamarre
]

# Analyze each user
for email, user in all_users.items():
    first_name = user.get('firstName', '').lower()
    last_name = user.get('lastName', '').lower()
    company = user.get('company', '').lower()

    # Check for test patterns
    is_test = False
    for pattern in test_patterns:
        if re.search(pattern, email, re.IGNORECASE):
            test_accounts.append({
                'email': email,
                'firstName': user.get('firstName', ''),
                'lastName': user.get('lastName', ''),
                'signupDate': user.get('signupDate', ''),
                'reason': f'Matches pattern: {pattern}'
            })
            is_test = True
            break

    if is_test:
        continue

    # Check for personal emails
    if email in personal_emails:
        personal_accounts.append({
            'email': email,
            'firstName': user.get('firstName', ''),
            'lastName': user.get('lastName', ''),
            'signupDate': user.get('signupDate', ''),
            'analysisCount': user.get('analysisCount', 0),
        })
        continue

    # Check for known friends
    if email in known_friends:
        friend_accounts.append({
            'email': email,
            'firstName': user.get('firstName', ''),
            'lastName': user.get('lastName', ''),
            'signupDate': user.get('signupDate', ''),
            'analysisCount': user.get('analysisCount', 0),
        })
        continue

    # Check for Rob, Tom, Adam in name fields
    if 'rob' in first_name or 'rob' in last_name:
        friend_accounts.append({
            'email': email,
            'firstName': user.get('firstName', ''),
            'lastName': user.get('lastName', ''),
            'signupDate': user.get('signupDate', ''),
            'analysisCount': user.get('analysisCount', 0),
            'note': 'Possible Rob?'
        })
        continue

    if 'tom' in first_name or 'tom' in last_name:
        friend_accounts.append({
            'email': email,
            'firstName': user.get('firstName', ''),
            'lastName': user.get('lastName', ''),
            'signupDate': user.get('signupDate', ''),
            'analysisCount': user.get('analysisCount', 0),
            'note': 'Possible Tom?'
        })
        continue

    if 'adam' in first_name or 'adam' in last_name:
        friend_accounts.append({
            'email': email,
            'firstName': user.get('firstName', ''),
            'lastName': user.get('lastName', ''),
            'signupDate': user.get('signupDate', ''),
            'analysisCount': user.get('analysisCount', 0),
            'note': 'Possible Adam?'
        })
        continue

    # Check for suspicious patterns (no name, recent signup, no activity)
    if not first_name and not last_name:
        analysisCount = user.get('analysisCount', 0)
        loginCount = user.get('loginCount', 0)
        if analysisCount == 0 and loginCount <= 1:
            suspicious.append({
                'email': email,
                'signupDate': user.get('signupDate', ''),
                'analysisCount': analysisCount,
                'loginCount': loginCount,
                'reason': 'No name, no activity'
            })
            continue

    # Everyone else is a "real user"
    real_users.append({
        'email': email,
        'firstName': user.get('firstName', ''),
        'lastName': user.get('lastName', ''),
        'company': user.get('company', ''),
        'signupDate': user.get('signupDate', ''),
        'analysisCount': user.get('analysisCount', 0),
        'loginCount': user.get('loginCount', 0),
    })

# Print results
print("=" * 80)
print("BREAKDOWN BY CATEGORY")
print("=" * 80)
print()

print(f"🧪 TEST ACCOUNTS: {len(test_accounts)}")
for acc in test_accounts[:10]:  # Show first 10
    print(f"   {acc['email']:<40} | {acc.get('reason', '')}")
if len(test_accounts) > 10:
    print(f"   ... and {len(test_accounts) - 10} more")
print()

print(f"👤 YOUR PERSONAL ACCOUNTS: {len(personal_accounts)}")
for acc in personal_accounts:
    print(f"   {acc['email']:<40} | {acc.get('firstName', '')} {acc.get('lastName', '')} | {acc.get('analysisCount', 0)} analyses")
print()

print(f"👥 FRIENDS/COLLEAGUES: {len(friend_accounts)}")
for acc in friend_accounts:
    note = acc.get('note', '')
    print(f"   {acc['email']:<40} | {acc.get('firstName', '')} {acc.get('lastName', '')} | {note}")
print()

print(f"⚠️  SUSPICIOUS (no name, no activity): {len(suspicious)}")
for acc in suspicious[:5]:
    print(f"   {acc['email']:<40} | Logins: {acc.get('loginCount', 0)}, Analyses: {acc.get('analysisCount', 0)}")
if len(suspicious) > 5:
    print(f"   ... and {len(suspicious) - 5} more")
print()

print(f"✅ REAL USERS: {len(real_users)}")
print()

# Show real users with activity
active_real_users = [u for u in real_users if u.get('analysisCount', 0) > 0]
print(f"   Active real users (ran analyses): {len(active_real_users)}")
for user in active_real_users:
    print(f"   {user['email']:<40} | {user['firstName']} {user['lastName']:<20} | {user['analysisCount']} analyses")
print()

# Summary
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print()
print(f"Total users:           {len(all_users)}")
print(f"Test accounts:         {len(test_accounts)} ({len(test_accounts)/len(all_users)*100:.1f}%)")
print(f"Personal accounts:     {len(personal_accounts)}")
print(f"Friends/colleagues:    {len(friend_accounts)}")
print(f"Suspicious:            {len(suspicious)}")
print(f"Real users:            {len(real_users)} ({len(real_users)/len(all_users)*100:.1f}%)")
print(f"  └─ With activity:    {len(active_real_users)}")
print()

# Export real users only
real_users_export = {
    'totalRealUsers': len(real_users),
    'activeRealUsers': len(active_real_users),
    'users': real_users,
    'exportedAt': '2026-01-01T23:30:00.000Z'
}

with open('/tmp/real_users_only.json', 'w') as f:
    json.dump(real_users_export, f, indent=2)

print(f"✅ Real users exported to: /tmp/real_users_only.json")
print()

# Save cleanup report
report = {
    'test_accounts': test_accounts,
    'personal_accounts': personal_accounts,
    'friend_accounts': friend_accounts,
    'suspicious': suspicious,
    'real_users': real_users,
}

with open('/tmp/user_cleanup_report.json', 'w') as f:
    json.dump(report, f, indent=2)

print(f"📋 Full cleanup report saved to: /tmp/user_cleanup_report.json")
print()

print("=" * 80)
print("NEXT STEPS")
print("=" * 80)
print()
print("1. Review the suspicious accounts - decide if they're real or test")
print("2. Check friend_accounts to see if Rob/Tom/Adam signed up")
print("3. Focus outreach on the 'real_users' list only")
print("4. Consider archiving/deleting test accounts to clean up metrics")
print()
