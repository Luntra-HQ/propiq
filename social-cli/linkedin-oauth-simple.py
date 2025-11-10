#!/usr/bin/env python3
"""
LinkedIn OAuth 2.0 - Simple Version
Manual code entry (no local server needed)
"""

import urllib.parse
import requests
import webbrowser

# Your LinkedIn app credentials
CLIENT_ID = "788dzgo3z4zmxc"
CLIENT_SECRET = "WPL_AP1.qi0A6bOf87q9n1ab.M5ETRw=="
REDIRECT_URI = "https://oauth.pstmn.io/v1/callback"  # Using Postman's redirect

# Scopes needed for posting to personal profile AND organization pages
SCOPES = [
    "openid",
    "profile",
    "email",
    "w_member_social",           # Post to personal profile
    "r_organization_social",      # Read organization info
    "w_organization_social"       # Post to organization pages
]

print("=" * 70)
print("🔐 LinkedIn OAuth 2.0 - Get Access Token with Organization Scopes")
print("=" * 70)

# Build authorization URL
scope_string = " ".join(SCOPES)
state = "random_state_12345"

auth_params = {
    'response_type': 'code',
    'client_id': CLIENT_ID,
    'redirect_uri': REDIRECT_URI,
    'state': state,
    'scope': scope_string
}

auth_url = f"https://www.linkedin.com/oauth/v2/authorization?{urllib.parse.urlencode(auth_params)}"

print("\n📋 Scopes requested:")
for scope in SCOPES:
    if scope == "w_organization_social":
        print(f"   ✅ {scope} - POST TO ORGANIZATION PAGES")
    elif scope == "r_organization_social":
        print(f"   ✅ {scope} - Read organization info")
    else:
        print(f"   • {scope}")

print("\n" + "=" * 70)
print("\n🌐 Step 1: Authorize in your browser")
print("\nOpening LinkedIn authorization page...")
print("\nIf browser doesn't open, visit this URL:")
print(f"\n{auth_url}\n")
print("=" * 70)

# Open browser
webbrowser.open(auth_url)

print("\n⏳ Step 2: After authorizing...")
print("\n   1. LinkedIn will redirect to a Postman page")
print("   2. The URL will contain 'code=...'")
print("   3. Copy ONLY the code part (the long string after 'code=')")
print("   4. Paste it below")
print("\n" + "=" * 70)

# Get authorization code from user
auth_code = input("\n📝 Paste the authorization code here: ").strip()

if not auth_code:
    print("\n❌ No code provided. Exiting.")
    exit(1)

print("\n🔄 Step 3: Exchanging code for access token...")

# Exchange code for access token
token_data = {
    'grant_type': 'authorization_code',
    'code': auth_code,
    'redirect_uri': REDIRECT_URI,
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
}

token_response = requests.post(
    'https://www.linkedin.com/oauth/v2/accessToken',
    data=token_data,
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)

if token_response.status_code != 200:
    print(f"\n❌ Failed to get access token:")
    print(f"   Status: {token_response.status_code}")
    print(f"   Response: {token_response.text}")
    exit(1)

token_json = token_response.json()
access_token = token_json.get('access_token')
expires_in = token_json.get('expires_in', 'unknown')

print("\n✅ Access token received!")
print("\n" + "=" * 70)
print("\n🎉 SUCCESS! Your access token:\n")
print(f"{access_token}\n")
print("=" * 70)
print(f"\n⏱️  Token expires in: {expires_in} seconds (~{int(expires_in)//86400} days)")
print("\n📝 Next step: Update your configuration:\n")
print(f'cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/social-cli"')
print(f'python3 manual-setup.py "{CLIENT_ID}" "{CLIENT_SECRET}" "{access_token}" "urn:li:person:qHxUoidbct"')
print("\n" + "=" * 70)
