#!/usr/bin/env python3
"""
PropIQ Microsoft Clarity Data Analysis
Analyzes session data to identify conversion bottlenecks and filter dev traffic
"""

import csv
import re
from datetime import datetime
from typing import Dict, List, Tuple
from collections import defaultdict

class ClarityAnalyzer:
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.raw_data = {}
        self.metrics = {}
        self.load_data()

    def load_data(self):
        """Parse Clarity CSV into structured metrics"""
        with open(self.csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            rows = list(reader)

            current_metric = None
            i = 0
            while i < len(rows):
                row = rows[i]

                # Check if this is a metric header row
                if row and row[0] == 'Metric':
                    if len(row) > 1:
                        current_metric = row[1]
                        self.metrics[current_metric] = []
                # Add data rows to current metric (rows with empty first column)
                elif current_metric and row and (not row[0] or row[0] == ''):
                    # Stop adding to this metric if we hit another Metric row next
                    if i + 1 < len(rows) and rows[i + 1] and rows[i + 1][0] == 'Metric':
                        current_metric = None
                    elif len(row) > 1 and row[1]:  # Has data in second column
                        self.metrics[current_metric].append(row)

                i += 1

        print(f"✓ Loaded {len(self.metrics)} metric categories")

    def filter_localhost_sessions(self) -> Dict:
        """Filter out localhost/development sessions"""
        if 'Top pages' not in self.metrics:
            return {}

        pages = self.metrics['Top pages']
        localhost_patterns = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            ':5173',  # Vite dev server
            ':8080',  # Common dev port
            ':3000',  # React dev server
        ]

        results = {
            'localhost_sessions': [],
            'production_sessions': [],
            'total_localhost': 0,
            'total_production': 0
        }

        for row in pages:
            if len(row) < 2:
                continue
            url = row[1]
            try:
                sessions = int(row[2]) if len(row) > 2 else 0
            except (ValueError, IndexError):
                continue

            is_localhost = any(pattern in url.lower() for pattern in localhost_patterns)

            if is_localhost:
                results['localhost_sessions'].append({
                    'url': url,
                    'sessions': sessions
                })
                results['total_localhost'] += sessions
            else:
                results['production_sessions'].append({
                    'url': url,
                    'sessions': sessions
                })
                results['total_production'] += sessions

        return results

    def calculate_conversion_funnel(self, exclude_localhost: bool = True) -> Dict:
        """Calculate conversion rates through the funnel"""
        # Get total sessions
        total_sessions = 0
        for row in self.metrics.get('Sessions', []):
            if row[1] == 'Total sessions':
                total_sessions = int(row[2])
                break

        # Adjust for localhost if needed
        if exclude_localhost:
            localhost_data = self.filter_localhost_sessions()
            adjusted_sessions = localhost_data['total_production']
        else:
            adjusted_sessions = total_sessions

        # Get conversion events
        events = {}
        if 'Smart events' in self.metrics:
            for row in self.metrics['Smart events']:
                if len(row) >= 3 and row[1]:
                    event_name = row[1]
                    try:
                        event_count = int(row[2])
                        events[event_name] = event_count
                    except (ValueError, IndexError):
                        continue

        # Calculate funnel
        funnel = {
            'total_sessions': adjusted_sessions,
            'signups': events.get('Sign up', 0),
            'logins': events.get('Login', 0),
            'upgrades': events.get('Upgrade', 0),
            'conversion_rates': {}
        }

        if adjusted_sessions > 0:
            funnel['conversion_rates'] = {
                'signup_rate': (events.get('Sign up', 0) / adjusted_sessions) * 100,
                'login_rate': (events.get('Login', 0) / adjusted_sessions) * 100,
                'upgrade_rate': (events.get('Upgrade', 0) / adjusted_sessions) * 100,
            }

            # Calculate upgrade rate from signups
            if events.get('Sign up', 0) > 0:
                funnel['conversion_rates']['signup_to_upgrade'] = \
                    (events.get('Upgrade', 0) / events.get('Sign up', 0)) * 100

        return funnel

    def identify_dropoff_pages(self) -> Dict:
        """Identify pages with highest drop-off rates"""
        if 'Top pages' not in self.metrics:
            return {}

        pages = []
        for row in self.metrics['Top pages']:
            if len(row) >= 3 and row[1]:
                url = row[1]
                # Skip localhost
                if 'localhost' in url.lower():
                    continue
                try:
                    sessions = int(row[2])
                    pages.append({
                        'url': url,
                        'sessions': sessions,
                        'page_type': self._classify_page(url)
                    })
                except (ValueError, IndexError):
                    continue

        # Sort by sessions descending
        pages.sort(key=lambda x: x['sessions'], reverse=True)

        # Calculate drop-off indicators
        insights = self.metrics.get('Insights', [])
        total_sessions = sum(p['sessions'] for p in pages)

        dropoff_indicators = {
            'rage_clicks': 0,
            'dead_clicks': 0,
            'quick_backs': 0
        }

        for row in insights:
            if len(row) >= 3 and row[1]:
                metric = row[1].lower()
                try:
                    count = int(row[2])
                    if 'rage' in metric:
                        dropoff_indicators['rage_clicks'] = count
                    elif 'dead' in metric:
                        dropoff_indicators['dead_clicks'] = count
                    elif 'quick back' in metric:
                        dropoff_indicators['quick_backs'] = count
                except (ValueError, IndexError):
                    continue

        return {
            'pages': pages[:10],  # Top 10
            'dropoff_indicators': dropoff_indicators,
            'total_production_sessions': total_sessions
        }

    def _classify_page(self, url: str) -> str:
        """Classify page type from URL"""
        url_lower = url.lower()
        if '/signup' in url_lower:
            return 'signup'
        elif '/login' in url_lower:
            return 'login'
        elif '/pricing' in url_lower:
            return 'pricing'
        elif '/app' in url_lower:
            return 'app'
        elif url_lower.endswith('/'):
            return 'landing'
        else:
            return 'other'

    def analyze_javascript_errors(self) -> Dict:
        """Analyze JS errors that could block conversion"""
        if 'JavaScript errors' not in self.metrics:
            return {}

        errors = []
        total_error_sessions = 0

        for row in self.metrics['JavaScript errors']:
            if len(row) >= 3 and row[1]:
                error_msg = row[1].lower()
                # Skip header rows
                if 'sessions with' in error_msg or 'total javascript' in error_msg:
                    continue
                try:
                    count = int(row[2])
                    percentage = row[3] if len(row) > 3 else '0%'

                    errors.append({
                        'error': row[1],
                        'sessions': count,
                        'percentage': percentage,
                        'severity': self._classify_error_severity(row[1]),
                        'blocks_upgrade': self._blocks_upgrade_flow(row[1])
                    })
                    total_error_sessions += count
                except (ValueError, IndexError):
                    continue

        return {
            'total_error_sessions': total_error_sessions,
            'errors': errors,
            'critical_errors': [e for e in errors if e['blocks_upgrade']]
        }

    def _classify_error_severity(self, error_msg: str) -> str:
        """Classify error severity"""
        error_lower = error_msg.lower()

        # Critical errors
        if any(term in error_lower for term in ['cannot read', 'undefined', 'null', 'typeerror']):
            return 'HIGH'
        # Warning level
        elif any(term in error_lower for term in ['resizeobserver', 'network']):
            return 'MEDIUM'
        # Generic/unknown
        elif 'script error' in error_lower:
            return 'MEDIUM'
        else:
            return 'LOW'

    def _blocks_upgrade_flow(self, error_msg: str) -> bool:
        """Determine if error could block upgrade/checkout flow"""
        error_lower = error_msg.lower()

        # Errors that likely block user interactions
        blocking_indicators = [
            'cannot read properties',
            'undefined',
            'uselayouteffect',  # React hook error could break rendering
            'typeerror',
            'payment',
            'checkout',
            'stripe',
            'submit'
        ]

        return any(indicator in error_lower for indicator in blocking_indicators)

    def get_bot_traffic_stats(self) -> Dict:
        """Analyze bot traffic patterns"""
        if 'Bot traffic' not in self.metrics:
            return {}

        bot_types = {}
        total_bots = 0

        for row in self.metrics['Bot traffic']:
            if len(row) >= 2 and row[0]:
                bot_type = row[0]
                if bot_type == '__typename':
                    continue
                try:
                    count = int(row[1])
                    bot_types[bot_type] = count
                    total_bots += count
                except (ValueError, IndexError):
                    continue

        return {
            'total_bot_sessions': total_bots,
            'by_type': bot_types
        }

    def generate_clarity_filters(self) -> List[Dict]:
        """Generate Clarity filter configurations to exclude internal traffic"""
        filters = [
            {
                'name': 'Exclude Localhost Sessions',
                'type': 'URL Filter',
                'condition': 'URL does not contain',
                'values': ['localhost', '127.0.0.1', ':5173', ':8080', ':3000'],
                'description': 'Filters out all local development sessions'
            },
            {
                'name': 'Exclude Internal IPs',
                'type': 'IP Filter',
                'condition': 'IP address is not',
                'values': ['<YOUR_OFFICE_IP>', '<YOUR_HOME_IP>'],
                'description': 'Add your development team IPs here'
            },
            {
                'name': 'Production Traffic Only',
                'type': 'URL Filter',
                'condition': 'URL contains',
                'values': ['propiq.luntra.one'],
                'description': 'Only include production domain sessions'
            },
            {
                'name': 'Exclude Bot Traffic',
                'type': 'Built-in Filter',
                'condition': 'Enable bot filtering',
                'values': ['Suspicious device', 'Suspicious network', 'Suspicious interaction'],
                'description': 'Use Clarity\'s built-in bot detection'
            },
            {
                'name': 'Real User Sessions',
                'type': 'Combined Filter',
                'condition': 'All of the following',
                'rules': [
                    'URL contains propiq.luntra.one',
                    'URL does not contain localhost',
                    'Session duration > 5 seconds',
                    'Not flagged as bot'
                ],
                'description': 'Comprehensive filter for genuine user sessions'
            }
        ]

        return filters

    def generate_report(self):
        """Generate comprehensive analysis report"""
        print("\n" + "="*70)
        print("PropIQ CLARITY DATA ANALYSIS REPORT")
        print("="*70)

        # 1. Localhost filtering
        print("\n📊 1. LOCALHOST SESSION FILTERING")
        print("-" * 70)
        localhost_data = self.filter_localhost_sessions()
        print(f"Total Localhost Sessions: {localhost_data['total_localhost']}")
        print(f"Total Production Sessions: {localhost_data['total_production']}")
        total = localhost_data['total_localhost'] + localhost_data['total_production']
        if total > 0:
            pct = (localhost_data['total_localhost'] / total) * 100
            print(f"Localhost Percentage: {pct:.1f}%")

        print("\nLocalhost URLs:")
        for item in localhost_data['localhost_sessions']:
            print(f"  - {item['url']}: {item['sessions']} sessions")

        # 2. Conversion funnel
        print("\n💰 2. CONVERSION FUNNEL ANALYSIS")
        print("-" * 70)

        print("\n[WITH LOCALHOST - SKEWED DATA]")
        funnel_with = self.calculate_conversion_funnel(exclude_localhost=False)
        self._print_funnel(funnel_with)

        print("\n[WITHOUT LOCALHOST - TRUE METRICS]")
        funnel_without = self.calculate_conversion_funnel(exclude_localhost=True)
        self._print_funnel(funnel_without)

        # 3. Drop-off analysis
        print("\n🚨 3. DROP-OFF PAGE ANALYSIS")
        print("-" * 70)
        dropoff = self.identify_dropoff_pages()

        print("\nTop Production Pages by Traffic:")
        for i, page in enumerate(dropoff['pages'], 1):
            print(f"{i}. {page['page_type'].upper()}: {page['url']}")
            print(f"   Sessions: {page['sessions']}")

        print("\nDrop-off Indicators:")
        indicators = dropoff['dropoff_indicators']
        total_prod = dropoff['total_production_sessions']
        if total_prod > 0:
            print(f"  Rage Clicks: {indicators['rage_clicks']} ({(indicators['rage_clicks']/total_prod)*100:.2f}%)")
            print(f"  Dead Clicks: {indicators['dead_clicks']} ({(indicators['dead_clicks']/total_prod)*100:.2f}%)")
            print(f"  Quick Backs: {indicators['quick_backs']} ({(indicators['quick_backs']/total_prod)*100:.2f}%)")

        # 4. JavaScript errors
        print("\n🐛 4. JAVASCRIPT ERROR ANALYSIS")
        print("-" * 70)
        js_errors = self.analyze_javascript_errors()

        print(f"\nTotal Sessions with Errors: {js_errors.get('total_error_sessions', 0)}")
        print(f"Critical Errors (blocking upgrade): {len(js_errors.get('critical_errors', []))}")

        print("\nAll JavaScript Errors:")
        for error in js_errors.get('errors', []):
            print(f"\n  Error: {error['error']}")
            print(f"  Sessions: {error['sessions']} ({error['percentage']})")
            print(f"  Severity: {error['severity']}")
            print(f"  Blocks Upgrade: {'⚠️  YES' if error['blocks_upgrade'] else '✓ NO'}")

        # 5. Bot traffic
        print("\n🤖 5. BOT TRAFFIC STATS")
        print("-" * 70)
        bots = self.get_bot_traffic_stats()
        print(f"Total Bot Sessions: {bots.get('total_bot_sessions', 0)}")
        print("\nBy Type:")
        for bot_type, count in bots.get('by_type', {}).items():
            print(f"  {bot_type}: {count}")

        # 6. Clarity filters
        print("\n⚙️  6. RECOMMENDED CLARITY FILTERS")
        print("-" * 70)
        filters = self.generate_clarity_filters()
        for i, f in enumerate(filters, 1):
            print(f"\nFilter {i}: {f['name']}")
            print(f"  Type: {f['type']}")
            print(f"  Condition: {f['condition']}")
            if isinstance(f.get('values'), list):
                print(f"  Values: {', '.join(f['values'])}")
            elif 'rules' in f:
                print("  Rules:")
                for rule in f['rules']:
                    print(f"    - {rule}")
            print(f"  Description: {f['description']}")

        print("\n" + "="*70)
        print("END OF REPORT")
        print("="*70 + "\n")

    def _print_funnel(self, funnel: Dict):
        """Print funnel metrics"""
        print(f"Total Sessions: {funnel['total_sessions']}")
        print(f"Signups: {funnel['signups']}")
        print(f"Logins: {funnel['logins']}")
        print(f"Upgrades: {funnel['upgrades']}")

        rates = funnel.get('conversion_rates', {})
        print(f"\nConversion Rates:")
        print(f"  Sessions → Signup: {rates.get('signup_rate', 0):.2f}%")
        print(f"  Sessions → Upgrade: {rates.get('upgrade_rate', 0):.2f}%")
        if 'signup_to_upgrade' in rates:
            print(f"  Signup → Upgrade: {rates.get('signup_to_upgrade', 0):.2f}%")


def main():
    csv_path = '/Users/briandusape/Downloads/Clarity_Prop_IQ_Dashboard_04-01-2026 10 59 AM.csv'

    analyzer = ClarityAnalyzer(csv_path)
    analyzer.generate_report()


if __name__ == '__main__':
    main()
