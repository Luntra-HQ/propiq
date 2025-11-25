#!/usr/bin/env python3
"""
LinkedIn OAuth 2.0 Helper
Get access token with organization scopes

Environment Variables (optional):
    LINKEDIN_CLIENT_ID: LinkedIn app client ID
    LINKEDIN_CLIENT_SECRET: LinkedIn app client secret
    LINKEDIN_REDIRECT_URI: OAuth redirect URI (default: http://localhost:8000/callback)

Usage:
    python3 linkedin-oauth.py

Or with custom configuration:
    export LINKEDIN_CLIENT_ID="your_client_id"
    export LINKEDIN_CLIENT_SECRET="your_client_secret"
    export LINKEDIN_REDIRECT_URI="http://localhost:3000/callback"
    python3 linkedin-oauth.py
"""

import webbrowser
import urllib.parse
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# LinkedIn app credentials - configurable via environment variables
CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "788dzgo3z4zmxc")
CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "WPL_AP1.qi0A6bOf87q9n1ab.M5ETRw==")
REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/callback")

# Scopes needed for posting to personal profile AND organization pages
SCOPES = [
    "openid",
    "profile",
    "email",
    "w_member_social",           # Post to personal profile
    "r_organization_social",      # Read organization info
    "w_organization_social"       # Post to organization pages (CRITICAL!)
]

# Global variable to store the authorization code
auth_code = None


class OAuthCallbackHandler(BaseHTTPRequestHandler):
    """Handle OAuth callback from LinkedIn"""

    def do_GET(self):
        """Handle GET request from LinkedIn redirect"""
        global auth_code

        # Parse the callback URL
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)

        if 'code' in params:
            auth_code = params['code'][0]

            # Send success page
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write("""
                <html>
                <body style="font-family: Arial; padding: 50px; text-align: center;">
                    <h1 style="color: green;">Authorization Successful!</h1>
                    <p>You can close this window and return to the terminal.</p>
                </body>
                </html>
            """.encode('utf-8'))
        elif 'error' in params:
            error = params['error'][0]
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f"""
                <html>
                <body style="font-family: Arial; padding: 50px; text-align: center;">
                    <h1 style="color: red;">Authorization Failed</h1>
                    <p>Error: {error}</p>
                    <p>Return to the terminal for instructions.</p>
                </body>
                </html>
            """.encode('utf-8'))

    def log_message(self, format, *args):
        """Suppress server logs"""
        pass


def get_access_token():
    """Complete OAuth flow to get access token"""

    print("🔐 LinkedIn OAuth 2.0 - Get Access Token with Organization Scopes\n")
    print("=" * 70)
    print("\n⚙️  Configuration:")
    print(f"   Client ID: {CLIENT_ID}")
    print(f"   Redirect URI: {REDIRECT_URI}")
    print("   (Set via environment variables: LINKEDIN_CLIENT_ID, LINKEDIN_REDIRECT_URI)\n")
    print("=" * 70)

    # Step 1: Build authorization URL
    scope_string = " ".join(SCOPES)
    state = "random_state_string_12345"

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
            print(f"   ✅ {scope} - POST TO ORGANIZATION PAGES (this is what you need!)")
        elif scope == "r_organization_social":
            print(f"   ✅ {scope} - Read organization info")
        else:
            print(f"   • {scope}")

    print("\n" + "=" * 70)
    print("\n🌐 Step 1: Opening LinkedIn authorization page in your browser...")
    print("\nIf browser doesn't open, visit this URL manually:")
    print(f"\n{auth_url}\n")

    # Open browser
    webbrowser.open(auth_url)

    print("=" * 70)
    print("\n⏳ Step 2: Waiting for authorization...")
    print("   (Authorize the app in your browser, then come back here)\n")

    # Step 2: Start local server to catch callback
    # Extract port from REDIRECT_URI
    redirect_parts = urllib.parse.urlparse(REDIRECT_URI)
    port = redirect_parts.port or 8000
    server = HTTPServer(('localhost', port), OAuthCallbackHandler)

    # Wait for one request (the callback)
    server.handle_request()

    if not auth_code:
        print("\n❌ Failed to get authorization code.")
        print("   Make sure you authorized the app in your browser.")
        sys.exit(1)

    print("✅ Authorization code received!\n")

    # Step 3: Exchange authorization code for access token
    print("🔄 Step 3: Exchanging authorization code for access token...")

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
        print(f"\n❌ Failed to get access token: {token_response.text}")
        sys.exit(1)

    token_json = token_response.json()
    access_token = token_json.get('access_token')
    expires_in = token_json.get('expires_in', 'unknown')

    print("✅ Access token received!\n")
    print("=" * 70)
    print("\n🎉 SUCCESS! Your access token:\n")
    print(f"{access_token}\n")
    print("=" * 70)
    print(f"\n⏱️  Token expires in: {expires_in} seconds (~{int(expires_in)//86400} days)")
    print("\n📝 Next step: Update your configuration with this token:\n")
    print(f'python3 manual-setup.py "{CLIENT_ID}" "{CLIENT_SECRET}" "{access_token}" "urn:li:person:qHxUoidbct"')
    print("\n" + "=" * 70)

    return access_token


if __name__ == '__main__':
    try:
        get_access_token()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)
