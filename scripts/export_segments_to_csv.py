#!/usr/bin/env python3
"""
Convert January 2026 user segmentation JSON exports to CSV format
Processes all 5 segment files and creates clean CSV exports for email outreach
"""

import json
import csv
import os
from datetime import datetime

# Define segment files and their output CSV paths
SEGMENTS = [
    {
        "name": "1_Upgrade_Intent_PRIORITY",
        "input": "/tmp/segment1_upgrade_intent.json",
        "output": "/Users/briandusape/Projects/propiq/exports/segment1_upgrade_intent.csv",
    },
    {
        "name": "2_Signed_Up_Never_Used",
        "input": "/tmp/segment2_never_used.json",
        "output": "/Users/briandusape/Projects/propiq/exports/segment2_never_used.csv",
    },
    {
        "name": "3_Used_Product_No_Upgrade",
        "input": "/tmp/segment3_used_no_upgrade.json",
        "output": "/Users/briandusape/Projects/propiq/exports/segment3_used_no_upgrade.csv",
    },
    {
        "name": "4_Active_Users_2plus",
        "input": "/tmp/segment4_active_users.json",
        "output": "/Users/briandusape/Projects/propiq/exports/segment4_active_users.csv",
    },
    {
        "name": "5_Recent_Signups_14days",
        "input": "/tmp/segment5_recent_signups.json",
        "output": "/Users/briandusape/Projects/propiq/exports/segment5_recent_signups.csv",
    },
]

def convert_json_to_csv(input_path, output_path):
    """Convert JSON segment export to CSV format"""

    # Read JSON file
    with open(input_path, 'r') as f:
        data = json.load(f)

    users = data.get('users', [])

    if not users:
        print(f"  ⚠️  No users found in {input_path}")
        return 0

    # Get all unique field names from all user records
    fieldnames = set()
    for user in users:
        fieldnames.update(user.keys())

    # Sort fieldnames for consistent column order
    fieldnames = sorted(fieldnames)

    # Write CSV file
    with open(output_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(users)

    return len(users)

def main():
    """Main execution function"""

    print("=" * 70)
    print("PROPIQ JANUARY 2026 USER SEGMENTATION - CSV EXPORT")
    print("=" * 70)
    print()

    # Create exports directory if it doesn't exist
    exports_dir = "/Users/briandusape/Projects/propiq/exports"
    os.makedirs(exports_dir, exist_ok=True)
    print(f"✅ Created exports directory: {exports_dir}")
    print()

    # Process each segment
    total_users = 0
    segment_summary = []

    for segment in SEGMENTS:
        print(f"Processing: {segment['name']}")

        if not os.path.exists(segment['input']):
            print(f"  ❌ Input file not found: {segment['input']}")
            continue

        count = convert_json_to_csv(segment['input'], segment['output'])
        total_users += count

        segment_summary.append({
            "name": segment['name'],
            "count": count,
            "output": segment['output']
        })

        print(f"  ✅ Exported {count} users to {segment['output']}")
        print()

    # Print summary
    print("=" * 70)
    print("EXPORT SUMMARY")
    print("=" * 70)
    print()

    for item in segment_summary:
        print(f"{item['name']:<35} {item['count']:>5} users")

    print()
    print(f"{'TOTAL USERS EXPORTED':<35} {total_users:>5}")
    print()
    print(f"Exported at: {datetime.now().isoformat()}")
    print()
    print("=" * 70)
    print("✅ CSV export complete! Files ready for email outreach.")
    print("=" * 70)

if __name__ == "__main__":
    main()
