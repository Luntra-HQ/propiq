"""
LinkedIn API Integration
Official LinkedIn Posts API (2025)

Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
"""

import requests
import json
from pathlib import Path
from typing import Dict, Optional
from .config import get_config, save_config


API_BASE = "https://api.linkedin.com/v2"


def get_access_token() -> str:
    """Get LinkedIn access token from config"""
    config = get_config()
    token = config.get('linkedin', {}).get('access_token')
    if not token:
        raise ValueError("LinkedIn not configured. Run: propiq-cli setup linkedin")
    return token


def get_person_urn() -> str:
    """Get LinkedIn person URN from config"""
    config = get_config()
    urn = config.get('linkedin', {}).get('person_urn')
    if not urn:
        raise ValueError("LinkedIn person URN not found. Run: propiq-cli setup linkedin")
    return urn


def check_connection() -> Dict:
    """Check LinkedIn API connection status"""
    try:
        token = get_access_token()
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202302'
        }

        response = requests.get(
            f'{API_BASE}/userinfo',
            headers=headers
        )

        if response.status_code == 200:
            user_data = response.json()
            return {
                'connected': True,
                'account_name': user_data.get('name', 'Unknown')
            }
        else:
            return {'connected': False, 'error': response.text}

    except Exception as e:
        return {'connected': False, 'error': str(e)}


def post(content: str, image_path: Optional[str] = None) -> Dict:
    """
    Post content to LinkedIn

    Args:
        content: Text content to post
        image_path: Optional path to image file

    Returns:
        Dict with post_url and post_id
    """
    token = get_access_token()
    person_urn = get_person_urn()

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202302'
    }

    # Build post payload (using Posts API)
    post_data = {
        "author": person_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": content
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    # If image is provided, upload it first
    if image_path:
        image_urn = upload_image(image_path, token, person_urn)
        post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
        post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
            {
                "status": "READY",
                "media": image_urn
            }
        ]

    # Post to LinkedIn
    response = requests.post(
        f'{API_BASE}/ugcPosts',
        headers=headers,
        json=post_data
    )

    if response.status_code in [200, 201]:
        result = response.json()
        post_id = result.get('id', '')
        # LinkedIn post URL format
        post_url = f"https://www.linkedin.com/feed/update/{post_id}"

        # Log to local database
        log_post('linkedin', content, post_url)

        return {
            'success': True,
            'post_id': post_id,
            'post_url': post_url
        }
    else:
        raise Exception(f"LinkedIn API error: {response.status_code} - {response.text}")


def upload_image(image_path: str, token: str, person_urn: str) -> str:
    """
    Upload image to LinkedIn

    Args:
        image_path: Path to image file
        token: LinkedIn access token
        person_urn: LinkedIn person URN

    Returns:
        Image asset URN
    """
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202302'
    }

    # Step 1: Register upload
    register_payload = {
        "registerUploadRequest": {
            "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
            "owner": person_urn,
            "serviceRelationships": [
                {
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent"
                }
            ]
        }
    }

    response = requests.post(
        f'{API_BASE}/assets?action=registerUpload',
        headers=headers,
        json=register_payload
    )

    if response.status_code not in [200, 201]:
        raise Exception(f"Image registration failed: {response.text}")

    upload_data = response.json()
    asset_urn = upload_data['value']['asset']
    upload_url = upload_data['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl']

    # Step 2: Upload image binary
    with open(image_path, 'rb') as image_file:
        image_bytes = image_file.read()

    upload_headers = {
        'Authorization': f'Bearer {token}'
    }

    upload_response = requests.put(
        upload_url,
        headers=upload_headers,
        data=image_bytes
    )

    if upload_response.status_code not in [200, 201]:
        raise Exception(f"Image upload failed: {upload_response.text}")

    return asset_urn


def log_post(platform: str, content: str, url: str):
    """Log posted content to local database"""
    from datetime import datetime
    import sqlite3

    db_path = Path(__file__).parent.parent / 'data' / 'posts.db'
    db_path.parent.mkdir(exist_ok=True)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT,
            content TEXT,
            url TEXT,
            posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Insert post
    cursor.execute(
        'INSERT INTO posts (platform, content, url) VALUES (?, ?, ?)',
        (platform, content[:500], url)  # Truncate content to 500 chars for storage
    )

    conn.commit()
    conn.close()


def get_analytics(days: int = 7) -> Dict:
    """
    Get LinkedIn analytics for recent posts

    Args:
        days: Number of days to analyze

    Returns:
        Dict with analytics data
    """
    # This requires LinkedIn Marketing API access
    # For now, return placeholder
    return {
        'platform': 'linkedin',
        'days': days,
        'total_posts': 0,
        'total_impressions': 0,
        'total_engagement': 0,
        'note': 'LinkedIn analytics require Marketing API access'
    }
