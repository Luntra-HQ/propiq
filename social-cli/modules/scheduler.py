"""
Scheduler Module
Schedule posts for future publishing
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Dict
import uuid


DB_PATH = Path(__file__).parent.parent / 'data' / 'scheduled_posts.db'


def init_db():
    """Initialize scheduled posts database"""
    DB_PATH.parent.mkdir(exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scheduled_posts (
            id TEXT PRIMARY KEY,
            platform TEXT NOT NULL,
            content TEXT NOT NULL,
            caption TEXT,
            scheduled_time TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            posted_at TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()


def schedule_post(platform: str, content: str, scheduled_time: str, caption: str = None) -> Dict:
    """
    Schedule a post for future publishing

    Args:
        platform: Platform to post to (linkedin, instagram-reel, youtube-short)
        content: Post content or path to video file
        scheduled_time: When to post (YYYY-MM-DD HH:MM format)
        caption: Caption for video posts

    Returns:
        Dict with schedule_id
    """
    init_db()

    # Validate scheduled_time format
    try:
        datetime.strptime(scheduled_time, '%Y-%m-%d %H:%M')
    except ValueError:
        raise ValueError("Invalid date format. Use: YYYY-MM-DD HH:MM")

    # Generate unique ID
    schedule_id = str(uuid.uuid4())[:8]

    # Save to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO scheduled_posts (id, platform, content, caption, scheduled_time, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (schedule_id, platform, content, caption, scheduled_time, 'pending'))

    conn.commit()
    conn.close()

    return {
        'success': True,
        'schedule_id': schedule_id,
        'scheduled_time': scheduled_time
    }


def get_pending_posts() -> list:
    """Get all pending scheduled posts"""
    init_db()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, platform, content, caption, scheduled_time
        FROM scheduled_posts
        WHERE status = 'pending'
        ORDER BY scheduled_time ASC
    ''')

    posts = []
    for row in cursor.fetchall():
        posts.append({
            'id': row[0],
            'platform': row[1],
            'content': row[2],
            'caption': row[3],
            'scheduled_time': row[4]
        })

    conn.close()
    return posts


def get_posts_due_now() -> list:
    """Get posts that should be posted now"""
    init_db()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    now = datetime.now().strftime('%Y-%m-%d %H:%M')

    cursor.execute('''
        SELECT id, platform, content, caption
        FROM scheduled_posts
        WHERE status = 'pending' AND scheduled_time <= ?
        ORDER BY scheduled_time ASC
    ''', (now,))

    posts = []
    for row in cursor.fetchall():
        posts.append({
            'id': row[0],
            'platform': row[1],
            'content': row[2],
            'caption': row[3]
        })

    conn.close()
    return posts


def mark_posted(schedule_id: str):
    """Mark a scheduled post as posted"""
    init_db()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE scheduled_posts
        SET status = 'posted', posted_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (schedule_id,))

    conn.commit()
    conn.close()


def cancel_scheduled_post(schedule_id: str):
    """Cancel a scheduled post"""
    init_db()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE scheduled_posts
        SET status = 'cancelled'
        WHERE id = ?
    ''', (schedule_id,))

    conn.commit()
    conn.close()
