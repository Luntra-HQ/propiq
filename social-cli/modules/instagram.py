"""
Instagram Graph API Integration
Post Reels to Instagram Business/Creator accounts

Documentation: https://developers.facebook.com/docs/instagram-api/reference/ig-user/media
"""

import requests
import time
from pathlib import Path
from typing import Dict
from .config import get_config


API_BASE = "https://graph.facebook.com/v19.0"


def get_access_token() -> str:
    """Get Instagram access token from config"""
    config = get_config()
    token = config.get('instagram', {}).get('access_token')
    if not token:
        raise ValueError("Instagram not configured. Run: propiq-cli setup instagram")
    return token


def get_instagram_account_id() -> str:
    """Get Instagram Business Account ID from config"""
    config = get_config()
    account_id = config.get('instagram', {}).get('account_id')
    if not account_id:
        raise ValueError("Instagram account ID not found. Run: propiq-cli setup instagram")
    return account_id


def check_connection() -> Dict:
    """Check Instagram API connection status"""
    try:
        token = get_access_token()
        account_id = get_instagram_account_id()

        response = requests.get(
            f'{API_BASE}/{account_id}',
            params={
                'fields': 'username,name',
                'access_token': token
            }
        )

        if response.status_code == 200:
            data = response.json()
            return {
                'connected': True,
                'account_name': f"@{data.get('username', 'unknown')}"
            }
        else:
            return {'connected': False, 'error': response.text}

    except Exception as e:
        return {'connected': False, 'error': str(e)}


def post_reel(video_path: str, caption: str, share_to_feed: bool = True) -> Dict:
    """
    Post a Reel to Instagram

    Args:
        video_path: Path to video file (must be publicly accessible URL OR local file to upload)
        caption: Reel caption
        share_to_feed: Whether to share to feed (default True)

    Returns:
        Dict with permalink and media_id

    Note: Video must be:
    - Format: MP4 or MOV
    - Length: Up to 90 seconds
    - Aspect ratio: 9:16 (vertical)
    """
    token = get_access_token()
    account_id = get_instagram_account_id()

    # If local file, need to upload to publicly accessible location first
    # For now, assume video_path is a public URL
    # TODO: Add file upload to cloud storage (S3, Cloudinary, etc.)

    if Path(video_path).exists():
        raise NotImplementedError(
            "Local file upload not yet implemented. "
            "Please upload video to a public URL first (e.g., Cloudinary, S3). "
            "Then pass the URL to this function."
        )

    video_url = video_path

    # Step 1: Create Reel container
    print("📤 Creating Reel container...")
    container_response = requests.post(
        f'{API_BASE}/{account_id}/media',
        params={
            'media_type': 'REELS',
            'video_url': video_url,
            'caption': caption,
            'share_to_feed': share_to_feed,
            'access_token': token
        }
    )

    if container_response.status_code not in [200, 201]:
        raise Exception(f"Failed to create Reel container: {container_response.text}")

    container_data = container_response.json()
    container_id = container_data['id']

    # Step 2: Wait for video processing
    print("⏳ Processing video (this may take 30-60 seconds)...")
    max_attempts = 30
    for attempt in range(max_attempts):
        status_response = requests.get(
            f'{API_BASE}/{container_id}',
            params={
                'fields': 'status_code',
                'access_token': token
            }
        )

        if status_response.status_code == 200:
            status_data = status_response.json()
            status_code = status_data.get('status_code')

            if status_code == 'FINISHED':
                break
            elif status_code == 'ERROR':
                raise Exception("Video processing failed")
            elif status_code == 'IN_PROGRESS':
                time.sleep(2)
            else:
                time.sleep(2)
        else:
            raise Exception(f"Failed to check status: {status_response.text}")

    # Step 3: Publish the Reel
    print("📢 Publishing Reel...")
    publish_response = requests.post(
        f'{API_BASE}/{account_id}/media_publish',
        params={
            'creation_id': container_id,
            'access_token': token
        }
    )

    if publish_response.status_code not in [200, 201]:
        raise Exception(f"Failed to publish Reel: {publish_response.text}")

    publish_data = publish_response.json()
    media_id = publish_data['id']

    # Get permalink
    permalink_response = requests.get(
        f'{API_BASE}/{media_id}',
        params={
            'fields': 'permalink',
            'access_token': token
        }
    )

    permalink = permalink_response.json().get('permalink', '')

    # Log to database
    from .linkedin import log_post
    log_post('instagram', caption, permalink)

    return {
        'success': True,
        'media_id': media_id,
        'permalink': permalink
    }


def get_analytics(days: int = 7) -> Dict:
    """
    Get Instagram analytics for recent Reels

    Args:
        days: Number of days to analyze

    Returns:
        Dict with analytics data
    """
    token = get_access_token()
    account_id = get_instagram_account_id()

    # Get recent media
    response = requests.get(
        f'{API_BASE}/{account_id}/media',
        params={
            'fields': 'id,media_type,timestamp,like_count,comments_count,insights.metric(plays,reach,saved)',
            'access_token': token,
            'limit': 25
        }
    )

    if response.status_code != 200:
        raise Exception(f"Failed to fetch analytics: {response.text}")

    data = response.json()
    media_items = data.get('data', [])

    # Filter for Reels only
    reels = [item for item in media_items if item.get('media_type') == 'VIDEO']

    total_plays = 0
    total_reach = 0
    total_saves = 0
    total_likes = 0
    total_comments = 0

    for reel in reels:
        total_likes += reel.get('like_count', 0)
        total_comments += reel.get('comments_count', 0)

        insights = reel.get('insights', {}).get('data', [])
        for insight in insights:
            metric = insight.get('name')
            value = insight.get('values', [{}])[0].get('value', 0)

            if metric == 'plays':
                total_plays += value
            elif metric == 'reach':
                total_reach += value
            elif metric == 'saved':
                total_saves += value

    return {
        'platform': 'instagram',
        'days': days,
        'total_reels': len(reels),
        'total_plays': total_plays,
        'total_reach': total_reach,
        'total_saves': total_saves,
        'total_likes': total_likes,
        'total_comments': total_comments,
        'engagement_rate': round((total_likes + total_comments + total_saves) / total_reach * 100, 2) if total_reach > 0 else 0
    }
