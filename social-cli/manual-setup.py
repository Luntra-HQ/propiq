#!/usr/bin/env python3
"""
Manual LinkedIn Setup
For when interactive setup doesn't work
"""

import sys
from modules.config import update_platform_config

def setup_linkedin_manual(client_id, client_secret, access_token, person_urn=""):
    """Setup LinkedIn with provided credentials"""

    if not person_urn:
        person_urn = "urn:li:person:PLACEHOLDER"
        print("⚠️  Person URN not provided - you'll need to update it later")

    config = {
        'client_id': client_id,
        'client_secret': client_secret,
        'access_token': access_token,
        'person_urn': person_urn
    }

    update_platform_config('linkedin', config)
    print("✅ LinkedIn configured!")
    print(f"   Client ID: {client_id[:10]}...")
    print(f"   Person URN: {person_urn}")
    print()
    print("Test connection with: python3 propiq-cli.py status")

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python3 manual-setup.py <client_id> <client_secret> <access_token> [person_urn]")
        print()
        print("Example:")
        print('  python3 manual-setup.py "86abc123xyz" "WPL_AP1.abc123..." "AQV...token..." "urn:li:person:12345"')
        sys.exit(1)

    client_id = sys.argv[1]
    client_secret = sys.argv[2]
    access_token = sys.argv[3]
    person_urn = sys.argv[4] if len(sys.argv) > 4 else ""

    setup_linkedin_manual(client_id, client_secret, access_token, person_urn)
