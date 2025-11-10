"""
Configuration Management
Handles API credentials and settings
"""

import json
from pathlib import Path
from typing import Dict


CONFIG_FILE = Path.home() / '.propiq-cli' / 'config.json'


def get_config() -> Dict:
    """Load configuration from file"""
    if not CONFIG_FILE.exists():
        return {}

    with open(CONFIG_FILE) as f:
        return json.load(f)


def save_config(config: Dict):
    """Save configuration to file"""
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)


def update_platform_config(platform: str, settings: Dict):
    """Update configuration for a specific platform"""
    config = get_config()
    config[platform] = settings
    save_config(config)


def get_platform_config(platform: str) -> Dict:
    """Get configuration for a specific platform"""
    config = get_config()
    return config.get(platform, {})
