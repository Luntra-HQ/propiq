"""
YouTube Data API Integration
Post Shorts to YouTube

Documentation: https://developers.google.com/youtube/v3/docs/videos/insert
"""

import requests
from pathlib import Path
from typing import Dict
from .config import get_config


API_BASE = "https://www.googleapis.com/youtube/v3"


def get_access_token() -> str:
    """Get YouTube access token from config"""
    config = get_config()
    token = config.get('youtube', {}).get('access_token')
    if not token:
        raise ValueError("YouTube not configured. Run: propiq-cli setup youtube")
    return token


def check_connection() -> Dict:
    """Check YouTube API connection status"""
    try:
        token = get_access_token()

        response = requests.get(
            f'{API_BASE}/channels',
            params={
                'part': 'snippet',
                'mine': True
            },
            headers={
                'Authorization': f'Bearer {token}'
            }
        )

        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            if items:
                channel_name = items[0]['snippet']['title']
                return {
                    'connected': True,
                    'account_name': channel_name
                }

        return {'connected': False, 'error': response.text}

    except Exception as e:
        return {'connected': False, 'error': str(e)}


def post_short(video_path: str, title: str, description: str = "", tags: list = None) -> Dict:
    """
    Post a Short to YouTube

    Args:
        video_path: Path to video file
        title: Video title
        description: Video description
        tags: List of tags

    Returns:
        Dict with video_url and video_id

    Note: Video must be:
    - Format: MP4, MOV, AVI, etc.
    - Length: Up to 60 seconds for Shorts
    - Aspect ratio: 9:16 (vertical) preferred
    """
    token = get_access_token()

    if not Path(video_path).exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    # Add #Shorts to description to mark as Short
    if "#Shorts" not in description and "#shorts" not in description:
        description = f"{description}\n\n#Shorts"

    # Video metadata
    metadata = {
        'snippet': {
            'title': title,
            'description': description,
            'tags': tags or ['real estate', 'investing', 'PropIQ'],
            'categoryId': '22'  # People & Blogs (or '28' for Science & Technology)
        },
        'status': {
            'privacyStatus': 'public',
            'selfDeclaredMadeForKids': False
        }
    }

    # Upload video
    print("📤 Uploading video to YouTube...")

    # Note: This requires multipart upload
    # For production, use google-api-python-client library
    # For now, provide instructions for manual upload or use google-api-python-client

    raise NotImplementedError(
        "YouTube upload requires google-api-python-client library. "
        "Install with: pip install google-api-python-client google-auth-oauthlib\n"
        "Then use the upload_with_google_client() function."
    )


def upload_with_google_client(video_path: str, title: str, description: str = "", tags: list = None) -> Dict:
    """
    Upload video using google-api-python-client (recommended method)

    This requires:
    pip install google-api-python-client google-auth-oauthlib
    """
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        from google.oauth2.credentials import Credentials
    except ImportError:
        raise ImportError(
            "google-api-python-client not installed. "
            "Install with: pip install google-api-python-client google-auth-oauthlib"
        )

    config = get_config()
    creds_data = config.get('youtube', {})

    credentials = Credentials(
        token=creds_data.get('access_token'),
        refresh_token=creds_data.get('refresh_token'),
        token_uri='https://oauth2.googleapis.com/token',
        client_id=creds_data.get('client_id'),
        client_secret=creds_data.get('client_secret')
    )

    youtube = build('youtube', 'v3', credentials=credentials)

    # Add #Shorts to description
    if "#Shorts" not in description and "#shorts" not in description:
        description = f"{description}\n\n#Shorts"

    body = {
        'snippet': {
            'title': title,
            'description': description,
            'tags': tags or ['real estate', 'investing', 'PropIQ', 'Shorts'],
            'categoryId': '22'
        },
        'status': {
            'privacyStatus': 'public',
            'selfDeclaredMadeForKids': False
        }
    }

    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)

    request = youtube.videos().insert(
        part='snippet,status',
        body=body,
        media_body=media
    )

    print("📤 Uploading to YouTube...")
    response = request.execute()

    video_id = response['id']
    video_url = f"https://www.youtube.com/shorts/{video_id}"

    # Log to database
    from .linkedin import log_post
    log_post('youtube', title, video_url)

    return {
        'success': True,
        'video_id': video_id,
        'video_url': video_url
    }


def get_analytics(days: int = 7) -> Dict:
    """
    Get YouTube analytics for recent Shorts

    Args:
        days: Number of days to analyze

    Returns:
        Dict with analytics data
    """
    # YouTube Analytics API requires separate API access
    return {
        'platform': 'youtube',
        'days': days,
        'note': 'YouTube analytics require YouTube Analytics API access'
    }
