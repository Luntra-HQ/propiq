"""
PropIQ Power User Simulation Runner
====================================
Executes 5 realistic power-user simulations for chaos engineering and cost estimation.

Usage:
    python simulation_runner.py --config luntra-sim-profiles.yaml --output results/
    python simulation_runner.py --user "Portfolio-Manager-Paula" --single
    python simulation_runner.py --chaos-only  # Run only chaos scenarios

Features:
- Parallel execution of 5 users
- Cost tracking (Azure OpenAI, Stripe, infrastructure)
- Edge case triggering
- Detailed logging and reporting
"""

import asyncio
import yaml
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
import random
import requests
from pathlib import Path
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('simulation.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class CostMetrics:
    """Track costs for simulation"""
    azure_openai_input_tokens: int = 0
    azure_openai_output_tokens: int = 0
    stripe_transactions: List[float] = field(default_factory=list)
    api_requests: int = 0
    api_requests_by_endpoint: Dict[str, int] = field(default_factory=dict)

    @property
    def azure_openai_cost(self) -> float:
        """Calculate Azure OpenAI costs"""
        input_cost = (self.azure_openai_input_tokens / 1000) * 0.00015
        output_cost = (self.azure_openai_output_tokens / 1000) * 0.0006
        return input_cost + output_cost

    @property
    def stripe_fees(self) -> float:
        """Calculate Stripe transaction fees"""
        return sum((amount * 0.029) + 0.30 for amount in self.stripe_transactions)

    @property
    def total_cost(self) -> float:
        """Total estimated cost"""
        return self.azure_openai_cost + self.stripe_fees + 7.00  # + Render hosting


@dataclass
class SimulationResult:
    """Results from a single user simulation"""
    user_name: str
    start_time: datetime
    end_time: datetime
    actions_completed: int
    actions_failed: int
    edge_cases_triggered: List[str]
    errors_encountered: List[Dict]
    costs: CostMetrics
    conversion_achieved: bool

    @property
    def duration_seconds(self) -> float:
        return (self.end_time - self.start_time).total_seconds()

    @property
    def success_rate(self) -> float:
        total = self.actions_completed + self.actions_failed
        return (self.actions_completed / total * 100) if total > 0 else 0


# ============================================================================
# SIMULATION ENGINE
# ============================================================================

class PropIQSimulator:
    """Main simulation engine"""

    def __init__(self, config_path: str = "luntra-sim-profiles.yaml"):
        """Initialize simulator with config"""
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self.base_url = self.config['simulation_config']['base_url']
        self.session = requests.Session()
        self.results: List[SimulationResult] = []

        logger.info(f"Initialized simulator with base URL: {self.base_url}")

    def _load_config(self) -> Dict:
        """Load YAML configuration"""
        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)

    async def run_all_simulations(self, parallel: bool = True) -> List[SimulationResult]:
        """Run all 5 user simulations"""
        logger.info("Starting all user simulations...")

        if parallel:
            # Run all users concurrently
            tasks = [
                self.run_user_simulation(user_profile)
                for user_profile in self.config['simulations']
            ]
            self.results = await asyncio.gather(*tasks)
        else:
            # Run sequentially
            for user_profile in self.config['simulations']:
                result = await self.run_user_simulation(user_profile)
                self.results.append(result)

        logger.info(f"Completed {len(self.results)} simulations")
        return self.results

    async def run_user_simulation(self, user_profile: Dict) -> SimulationResult:
        """Run simulation for a single user"""
        user_name = user_profile['name']
        logger.info(f"Starting simulation for: {user_name}")

        start_time = datetime.now()
        costs = CostMetrics()
        actions_completed = 0
        actions_failed = 0
        edge_cases_triggered = []
        errors_encountered = []
        conversion_achieved = False

        # Track authentication token
        auth_token = None

        try:
            # Execute each action in sequence
            for action in user_profile['actions']:
                action_type = action['type']
                probability = action.get('probability', 1.0)

                # Check if action should execute based on probability
                if random.random() > probability:
                    logger.debug(f"{user_name}: Skipped {action_type} (probability: {probability})")
                    continue

                try:
                    # Execute action
                    logger.info(f"{user_name}: Executing {action_type}")

                    if action_type == "signup":
                        auth_token = await self._action_signup(action, costs)
                        actions_completed += 1

                    elif action_type == "login":
                        auth_token = await self._action_login(action, costs)
                        actions_completed += 1

                    elif action_type == "analyze_property":
                        await self._action_analyze_property(action, auth_token, costs)
                        actions_completed += 1

                    elif action_type == "batch_analyze_properties":
                        edge_cases = await self._action_batch_analyze(action, auth_token, costs)
                        edge_cases_triggered.extend(edge_cases)
                        actions_completed += 1

                    elif action_type == "use_deal_calculator":
                        await self._action_deal_calculator(action, costs)
                        actions_completed += 1

                    elif action_type == "send_support_message":
                        await self._action_support_chat(action, auth_token, costs)
                        actions_completed += 1

                    elif action_type == "create_checkout_session":
                        await self._action_create_checkout(action, auth_token, costs)
                        actions_completed += 1

                    elif action_type == "simulate_stripe_webhook":
                        conversion = await self._action_stripe_webhook(action, costs)
                        if conversion:
                            conversion_achieved = True
                        actions_completed += 1

                    elif action_type == "export_analyses":
                        edge_case = await self._action_export(action, auth_token, costs)
                        if edge_case:
                            edge_cases_triggered.append(edge_case)
                        actions_completed += 1

                    elif action_type == "get_analysis_history":
                        await self._action_get_history(action, auth_token, costs)
                        actions_completed += 1

                    elif action_type == "get_user_profile":
                        await self._action_get_profile(action, auth_token, costs)
                        actions_completed += 1

                    elif action_type == "concurrent_analyze_properties":
                        edge_case = await self._action_concurrent_analyze(action, auth_token, costs)
                        edge_cases_triggered.append(edge_case)
                        actions_completed += 1

                    else:
                        logger.warning(f"{user_name}: Unknown action type: {action_type}")

                except Exception as e:
                    logger.error(f"{user_name}: Failed {action_type}: {str(e)}")
                    actions_failed += 1
                    errors_encountered.append({
                        'action': action_type,
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    })

                # Add small delay between actions (max speed mode = minimal delay)
                if self.config['simulation_config'].get('max_speed', True):
                    await asyncio.sleep(0.1)
                else:
                    await asyncio.sleep(random.uniform(1, 3))

        except Exception as e:
            logger.error(f"{user_name}: Simulation failed: {str(e)}")

        end_time = datetime.now()

        result = SimulationResult(
            user_name=user_name,
            start_time=start_time,
            end_time=end_time,
            actions_completed=actions_completed,
            actions_failed=actions_failed,
            edge_cases_triggered=edge_cases_triggered,
            errors_encountered=errors_encountered,
            costs=costs,
            conversion_achieved=conversion_achieved
        )

        logger.info(f"{user_name}: Completed in {result.duration_seconds:.2f}s "
                   f"({actions_completed} succeeded, {actions_failed} failed)")

        return result

    # ========================================================================
    # ACTION IMPLEMENTATIONS
    # ========================================================================

    async def _action_signup(self, action: Dict, costs: CostMetrics) -> str:
        """Execute signup action"""
        response = self.session.post(
            f"{self.base_url}/auth/signup",
            json={
                'email': action['email'],
                'password': action['password'],
                'firstName': action.get('first_name', 'Sim'),
                'lastName': action.get('last_name', 'User')
            }
        )
        costs.api_requests += 1
        costs.api_requests_by_endpoint['/auth/signup'] = \
            costs.api_requests_by_endpoint.get('/auth/signup', 0) + 1

        if response.status_code != action['expected_status']:
            raise Exception(f"Expected {action['expected_status']}, got {response.status_code}")

        data = response.json()
        return data.get('access_token')

    async def _action_login(self, action: Dict, costs: CostMetrics) -> str:
        """Execute login action"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={
                'email': action['email'],
                'password': action['password']
            }
        )
        costs.api_requests += 1
        costs.api_requests_by_endpoint['/auth/login'] = \
            costs.api_requests_by_endpoint.get('/auth/login', 0) + 1

        if response.status_code != action['expected_status']:
            raise Exception(f"Login failed: {response.status_code}")

        data = response.json()
        return data.get('access_token')

    async def _action_analyze_property(self, action: Dict, auth_token: str,
                                      costs: CostMetrics) -> None:
        """Execute property analysis"""
        response = self.session.post(
            f"{self.base_url}/propiq/analyze",
            headers={'Authorization': f'Bearer {auth_token}'},
            json={'address': action['address']}
        )
        costs.api_requests += 1
        costs.api_requests_by_endpoint['/propiq/analyze'] = \
            costs.api_requests_by_endpoint.get('/propiq/analyze', 0) + 1

        # Estimate OpenAI token usage (rough estimate)
        if response.status_code == 200:
            costs.azure_openai_input_tokens += 500  # Estimated input
            costs.azure_openai_output_tokens += 1500  # Estimated output

        expected_status = action.get('expected_status', 200)
        if response.status_code != expected_status:
            if expected_status == 429 and response.status_code == 429:
                # Expected usage limit hit
                logger.info(f"Usage limit hit as expected")
                return
            raise Exception(f"Expected {expected_status}, got {response.status_code}")

    async def _action_batch_analyze(self, action: Dict, auth_token: str,
                                    costs: CostMetrics) -> List[str]:
        """Execute batch property analysis"""
        edge_cases = []
        addresses = action.get('addresses', [])

        for i, address in enumerate(addresses[:action['count']]):
            try:
                await self._action_analyze_property(
                    {'address': address, 'expected_status': action['expected_status']},
                    auth_token,
                    costs
                )

                # Add delay between analyses
                delay_range = action.get('delay_between_ms', [500, 1000])
                await asyncio.sleep(random.uniform(delay_range[0]/1000, delay_range[1]/1000))

            except Exception as e:
                logger.warning(f"Batch analyze failed for {address}: {e}")
                edge_cases.append(f"batch_analyze_failure_{i}")

        return edge_cases

    async def _action_deal_calculator(self, action: Dict, costs: CostMetrics) -> None:
        """Execute deal calculator action"""
        # Calculator is frontend-only, no API call needed
        # Just simulate the calculation
        costs.api_requests += 1
        costs.api_requests_by_endpoint['/calculator'] = \
            costs.api_requests_by_endpoint.get('/calculator', 0) + 1

        logger.debug(f"Calculator used with {action['count']} properties")
        await asyncio.sleep(0.05)  # Minimal delay

    async def _action_support_chat(self, action: Dict, auth_token: str,
                                   costs: CostMetrics) -> None:
        """Execute support chat action"""
        response = self.session.post(
            f"{self.base_url}/support/chat",
            headers={'Authorization': f'Bearer {auth_token}'},
            json={'message': action['message']}
        )
        costs.api_requests += 1
        costs.api_requests_by_endpoint['/support/chat'] = \
            costs.api_requests_by_endpoint.get('/support/chat', 0) + 1

        # Support chat uses OpenAI
        if response.status_code == 200:
            costs.azure_openai_input_tokens += 200
            costs.azure_openai_output_tokens += 400

    async def _action_create_checkout(self, action: Dict, auth_token: str,
                                      costs: CostMetrics) -> None:
        """Execute Stripe checkout session creation"""
        response = self.session.post(
            f"{self.base_url}/stripe/create-checkout-session",
            headers={'Authorization': f'Bearer {auth_token}'},
            json={
                'priceId': action['price_id'],
                'tier': action['tier']
            }
        )
        costs.api_requests += 1
        costs.api_requests_by_endpoint['/stripe/create-checkout-session'] = \
            costs.api_requests_by_endpoint.get('/stripe/create-checkout-session', 0) + 1

        if response.status_code != action['expected_status']:
            raise Exception(f"Checkout creation failed: {response.status_code}")

    async def _action_stripe_webhook(self, action: Dict, costs: CostMetrics) -> bool:
        """Simulate Stripe webhook event"""
        event_type = action['event_type']
        amount = action.get('amount', 0)

        # Track transaction
        if 'payment' in event_type or 'checkout' in event_type:
            costs.stripe_transactions.append(amount)

        costs.api_requests += 1
        costs.api_requests_by_endpoint['/stripe/webhook'] = \
            costs.api_requests_by_endpoint.get('/stripe/webhook', 0) + 1

        # Return True if this is a successful conversion
        return event_type == "checkout.session.completed"

    async def _action_export(self, action: Dict, auth_token: str,
                            costs: CostMetrics) -> Optional[str]:
        """Execute export action"""
        # Export endpoint may not exist yet - simulate
        response = self.session.post(
            f"{self.base_url}/propiq/export",
            headers={'Authorization': f'Bearer {auth_token}'},
            json={'format': action['format'], 'count': action['count']}
        )
        costs.api_requests += 1

        if response.status_code == 403:
            return "export_feature_restricted_free_tier"
        return None

    async def _action_get_history(self, action: Dict, auth_token: str,
                                  costs: CostMetrics) -> None:
        """Execute get analysis history"""
        response = self.session.get(
            f"{self.base_url}/propiq/history",
            headers={'Authorization': f'Bearer {auth_token}'},
            params={'limit': action.get('limit', 10)}
        )
        costs.api_requests += 1
        costs.api_requests_by_endpoint['/propiq/history'] = \
            costs.api_requests_by_endpoint.get('/propiq/history', 0) + 1

    async def _action_get_profile(self, action: Dict, auth_token: str,
                                  costs: CostMetrics) -> None:
        """Execute get user profile"""
        response = self.session.get(
            f"{self.base_url}{action['endpoint']}",
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        costs.api_requests += 1

    async def _action_concurrent_analyze(self, action: Dict, auth_token: str,
                                        costs: CostMetrics) -> str:
        """Execute concurrent property analyses"""
        addresses = action.get('addresses', [])

        # Fire all requests concurrently
        tasks = []
        for address in addresses[:action['count']]:
            task = self._action_analyze_property(
                {'address': address, 'expected_status': action['expected_status']},
                auth_token,
                costs
            )
            tasks.append(task)

        await asyncio.gather(*tasks)
        return f"concurrent_requests_{action['count']}"

    # ========================================================================
    # REPORTING
    # ========================================================================

    def generate_report(self, output_path: str = "simulation_report.json") -> Dict:
        """Generate comprehensive simulation report"""
        total_costs = CostMetrics()
        total_actions_completed = 0
        total_actions_failed = 0
        all_edge_cases = []
        all_errors = []
        conversions = 0

        for result in self.results:
            total_costs.azure_openai_input_tokens += result.costs.azure_openai_input_tokens
            total_costs.azure_openai_output_tokens += result.costs.azure_openai_output_tokens
            total_costs.stripe_transactions.extend(result.costs.stripe_transactions)
            total_costs.api_requests += result.costs.api_requests

            for endpoint, count in result.costs.api_requests_by_endpoint.items():
                total_costs.api_requests_by_endpoint[endpoint] = \
                    total_costs.api_requests_by_endpoint.get(endpoint, 0) + count

            total_actions_completed += result.actions_completed
            total_actions_failed += result.actions_failed
            all_edge_cases.extend(result.edge_cases_triggered)
            all_errors.extend(result.errors_encountered)

            if result.conversion_achieved:
                conversions += 1

        report = {
            'simulation_summary': {
                'total_users': len(self.results),
                'total_actions_completed': total_actions_completed,
                'total_actions_failed': total_actions_failed,
                'total_edge_cases_triggered': len(all_edge_cases),
                'total_errors': len(all_errors),
                'conversions_achieved': conversions,
                'conversion_rate': f"{(conversions / len(self.results) * 100):.1f}%"
            },
            'cost_analysis': {
                'azure_openai_input_tokens': total_costs.azure_openai_input_tokens,
                'azure_openai_output_tokens': total_costs.azure_openai_output_tokens,
                'azure_openai_cost_usd': f"${total_costs.azure_openai_cost:.2f}",
                'stripe_transactions': len(total_costs.stripe_transactions),
                'stripe_fees_usd': f"${total_costs.stripe_fees:.2f}",
                'total_cost_usd': f"${total_costs.total_cost:.2f}",
                'api_requests_total': total_costs.api_requests,
                'api_requests_by_endpoint': total_costs.api_requests_by_endpoint
            },
            'user_results': [
                {
                    'name': result.user_name,
                    'duration_seconds': result.duration_seconds,
                    'actions_completed': result.actions_completed,
                    'actions_failed': result.actions_failed,
                    'success_rate': f"{result.success_rate:.1f}%",
                    'edge_cases': result.edge_cases_triggered,
                    'errors': len(result.errors_encountered),
                    'conversion': result.conversion_achieved,
                    'cost_usd': f"${result.costs.total_cost:.2f}"
                }
                for result in self.results
            ],
            'edge_cases_triggered': list(set(all_edge_cases)),
            'errors_encountered': all_errors[:10]  # Top 10 errors
        }

        # Save report
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)

        logger.info(f"Report saved to {output_path}")
        return report

    def print_summary(self) -> None:
        """Print summary to console"""
        print("\n" + "="*80)
        print("PROPIQ POWER USER SIMULATION - RESULTS SUMMARY")
        print("="*80)

        for result in self.results:
            print(f"\n{result.user_name}:")
            print(f"  Duration: {result.duration_seconds:.1f}s")
            print(f"  Actions: {result.actions_completed} completed, {result.actions_failed} failed")
            print(f"  Success Rate: {result.success_rate:.1f}%")
            print(f"  Edge Cases: {len(result.edge_cases_triggered)}")
            print(f"  Conversion: {'✅ Yes' if result.conversion_achieved else '❌ No'}")
            print(f"  Cost: ${result.costs.total_cost:.2f}")

        # Calculate totals
        total_cost = sum(r.costs.total_cost for r in self.results)
        total_actions = sum(r.actions_completed for r in self.results)
        total_conversions = sum(1 for r in self.results if r.conversion_achieved)

        print(f"\n{'='*80}")
        print(f"TOTALS:")
        print(f"  Total Cost: ${total_cost:.2f}")
        print(f"  Total Actions: {total_actions}")
        print(f"  Conversions: {total_conversions}/{len(self.results)} ({total_conversions/len(self.results)*100:.1f}%)")
        print(f"{'='*80}\n")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

async def main():
    """Main execution function"""
    import argparse

    parser = argparse.ArgumentParser(description='PropIQ Power User Simulator')
    parser.add_argument('--config', default='luntra-sim-profiles.yaml',
                       help='Path to simulation config YAML')
    parser.add_argument('--output', default='simulation_report.json',
                       help='Path to output report')
    parser.add_argument('--user', help='Run single user simulation')
    parser.add_argument('--sequential', action='store_true',
                       help='Run users sequentially instead of parallel')

    args = parser.parse_args()

    # Initialize simulator
    simulator = PropIQSimulator(config_path=args.config)

    # Run simulations
    if args.user:
        # Single user simulation
        user_profile = next(
            (u for u in simulator.config['simulations'] if u['name'] == args.user),
            None
        )
        if not user_profile:
            logger.error(f"User {args.user} not found in config")
            return

        result = await simulator.run_user_simulation(user_profile)
        simulator.results = [result]
    else:
        # Run all users
        await simulator.run_all_simulations(parallel=not args.sequential)

    # Generate report
    simulator.generate_report(output_path=args.output)
    simulator.print_summary()


if __name__ == "__main__":
    asyncio.run(main())
