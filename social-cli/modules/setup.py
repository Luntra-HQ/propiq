"""
Interactive Setup Wizard
Configure API credentials for LinkedIn, Instagram, and YouTube
"""

import webbrowser
from .config import update_platform_config


def run_setup(platform: str = 'all'):
    """Run interactive setup for specified platform(s)"""

    if platform == 'all':
        print("🔧 PropIQ Social CLI Setup\n")
        print("We'll set up LinkedIn, Instagram, and YouTube API access.\n")

        setup_linkedin()
        print()
        setup_instagram()
        print()
        setup_youtube()
        print()
        print("✅ Setup complete! Run 'propiq-cli status' to verify connections.")

    elif platform == 'linkedin':
        setup_linkedin()
    elif platform == 'instagram':
        setup_instagram()
    elif platform == 'youtube':
        setup_youtube()
    else:
        print(f"❌ Unknown platform: {platform}")


def setup_linkedin():
    """Setup LinkedIn API credentials"""
    print("📘 LinkedIn Setup\n")
    print("You need to create a LinkedIn App to get API credentials.")
    print()
    print("Steps:")
    print("1. Go to: https://www.linkedin.com/developers/apps")
    print("2. Click 'Create app'")
    print("3. Fill in app details:")
    print("   - App name: PropIQ Social CLI")
    print("   - LinkedIn Page: Your personal or business page")
    print("   - App logo: (optional)")
    print("4. In 'Products' tab, add 'Share on LinkedIn' and 'Sign In with LinkedIn using OpenID Connect'")
    print("5. In 'Auth' tab, add redirect URL: http://localhost:8000/callback")
    print("6. Copy Client ID and Client Secret")
    print()

    open_browser = input("Open LinkedIn Developer Portal? (y/n): ").strip().lower()
    if open_browser == 'y':
        webbrowser.open('https://www.linkedin.com/developers/apps')

    print()
    client_id = input("Enter Client ID: ").strip()
    client_secret = input("Enter Client Secret: ").strip()

    # OAuth flow would happen here
    # For simplicity, ask for manual token
    print()
    print("To get an access token:")
    print("1. Use LinkedIn's OAuth 2.0 flow (automated in future version)")
    print("2. OR use a tool like Postman to get a token manually")
    print()

    access_token = input("Enter Access Token: ").strip()

    # Get person URN
    print()
    print("To get your Person URN:")
    print("1. Visit: https://www.linkedin.com/developers/tools/api-explorer")
    print("2. Call: GET https://api.linkedin.com/v2/userinfo")
    print("3. Copy the 'sub' field (it starts with a long number)")
    print()

    person_urn = input("Enter Person URN (or leave blank to fetch later): ").strip()
    if not person_urn:
        person_urn = "urn:li:person:YOUR_ID_HERE"

    # Save config
    config = {
        'client_id': client_id,
        'client_secret': client_secret,
        'access_token': access_token,
        'person_urn': person_urn
    }

    update_platform_config('linkedin', config)
    print("\n✅ LinkedIn configured!")


def setup_instagram():
    """Setup Instagram Graph API credentials"""
    print("📷 Instagram Setup\n")
    print("You need a Facebook Developer account and an Instagram Business/Creator account.")
    print()
    print("Steps:")
    print("1. Convert Instagram account to Business/Creator (if not already)")
    print("   - Instagram → Settings → Account → Switch to Professional Account")
    print("2. Connect Instagram to a Facebook Page")
    print("   - Instagram → Settings → Account → Linked Accounts → Facebook")
    print("3. Create Facebook App:")
    print("   - Go to: https://developers.facebook.com/apps")
    print("   - Click 'Create App'")
    print("   - Type: Business")
    print("   - Add product: Instagram Basic Display")
    print("4. Get access token:")
    print("   - In Graph API Explorer: https://developers.facebook.com/tools/explorer/")
    print("   - Select your app")
    print("   - Add permissions: instagram_content_publish, instagram_basic, pages_read_engagement")
    print("   - Generate token")
    print()

    open_browser = input("Open Facebook Developer Portal? (y/n): ").strip().lower()
    if open_browser == 'y':
        webbrowser.open('https://developers.facebook.com/apps')

    print()
    access_token = input("Enter Instagram Access Token: ").strip()

    print()
    print("To get your Instagram Account ID:")
    print("1. In Graph API Explorer: https://developers.facebook.com/tools/explorer/")
    print("2. Call: GET /me/accounts (gets your Facebook Pages)")
    print("3. Copy the Page ID")
    print("4. Call: GET /{page-id}?fields=instagram_business_account")
    print("5. Copy the Instagram Business Account ID")
    print()

    account_id = input("Enter Instagram Business Account ID: ").strip()

    # Save config
    config = {
        'access_token': access_token,
        'account_id': account_id
    }

    update_platform_config('instagram', config)
    print("\n✅ Instagram configured!")


def setup_youtube():
    """Setup YouTube Data API credentials"""
    print("🎥 YouTube Setup\n")
    print("You need a Google Cloud project with YouTube Data API enabled.")
    print()
    print("Steps:")
    print("1. Go to: https://console.cloud.google.com")
    print("2. Create a new project (or use existing)")
    print("3. Enable YouTube Data API v3:")
    print("   - APIs & Services → Enable APIs and Services")
    print("   - Search 'YouTube Data API v3'")
    print("   - Click Enable")
    print("4. Create OAuth 2.0 credentials:")
    print("   - APIs & Services → Credentials")
    print("   - Create Credentials → OAuth client ID")
    print("   - Application type: Desktop app")
    print("   - Download JSON file")
    print()

    open_browser = input("Open Google Cloud Console? (y/n): ").strip().lower()
    if open_browser == 'y':
        webbrowser.open('https://console.cloud.google.com')

    print()
    client_id = input("Enter Client ID: ").strip()
    client_secret = input("Enter Client Secret: ").strip()

    # OAuth flow would happen here
    print()
    print("To get access token:")
    print("1. Run OAuth flow (automated in future version)")
    print("2. OR use Google OAuth Playground: https://developers.google.com/oauthplayground")
    print()

    access_token = input("Enter Access Token: ").strip()
    refresh_token = input("Enter Refresh Token (optional): ").strip()

    # Save config
    config = {
        'client_id': client_id,
        'client_secret': client_secret,
        'access_token': access_token,
        'refresh_token': refresh_token
    }

    update_platform_config('youtube', config)
    print("\n✅ YouTube configured!")
