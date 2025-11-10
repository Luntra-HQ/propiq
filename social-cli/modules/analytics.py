"""
Analytics Module
Display analytics from LinkedIn, Instagram, and YouTube
"""

from typing import Dict
from . import linkedin, instagram, youtube


def get_analytics(platform: str, days: int = 7) -> Dict:
    """Get analytics for specified platform"""

    if platform == 'linkedin':
        return linkedin.get_analytics(days)
    elif platform == 'instagram':
        return instagram.get_analytics(days)
    elif platform == 'youtube':
        return youtube.get_analytics(days)
    elif platform == 'all':
        return {
            'linkedin': linkedin.get_analytics(days),
            'instagram': instagram.get_analytics(days),
            'youtube': youtube.get_analytics(days)
        }
    else:
        raise ValueError(f"Unknown platform: {platform}")


def display_analytics(data: Dict):
    """Display analytics in a readable format"""

    if 'linkedin' in data and 'instagram' in data:
        # All platforms
        print("\n📊 Analytics Summary (Last 7 Days)\n")
        print("="*60)

        for platform_name, platform_data in data.items():
            print(f"\n{platform_name.upper()}:")
            _display_platform_data(platform_data)

    else:
        # Single platform
        print(f"\n📊 {data.get('platform', 'Unknown').upper()} Analytics")
        print(f"   Last {data.get('days', 7)} days")
        print("="*60)
        _display_platform_data(data)


def _display_platform_data(data: Dict):
    """Display data for a single platform"""

    platform = data.get('platform', 'unknown')

    if platform == 'instagram':
        print(f"   Reels Posted: {data.get('total_reels', 0)}")
        print(f"   Total Plays: {data.get('total_plays', 0):,}")
        print(f"   Total Reach: {data.get('total_reach', 0):,}")
        print(f"   Saves: {data.get('total_saves', 0):,}")
        print(f"   Likes: {data.get('total_likes', 0):,}")
        print(f"   Comments: {data.get('total_comments', 0):,}")
        print(f"   Engagement Rate: {data.get('engagement_rate', 0)}%")

    elif platform == 'linkedin':
        print(f"   Posts: {data.get('total_posts', 0)}")
        print(f"   Impressions: {data.get('total_impressions', 0):,}")
        print(f"   Engagement: {data.get('total_engagement', 0):,}")
        if 'note' in data:
            print(f"   Note: {data['note']}")

    elif platform == 'youtube':
        print(f"   Videos: {data.get('total_videos', 0)}")
        print(f"   Views: {data.get('total_views', 0):,}")
        if 'note' in data:
            print(f"   Note: {data['note']}")

    else:
        # Generic display
        for key, value in data.items():
            if key not in ['platform', 'days']:
                print(f"   {key.replace('_', ' ').title()}: {value}")
