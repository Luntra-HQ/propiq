#!/usr/bin/env node

/**
 * PropIQ Analytics Dashboard
 *
 * Displays signup and traffic metrics from:
 * - Google Analytics 4 (page visits, conversions)
 * - Formspree (form submissions)
 *
 * Usage:
 *   node scripts/analytics-dashboard.js
 *   node scripts/analytics-dashboard.js --export
 */

import https from 'https';
import fs from 'fs';

// Configuration
const CONFIG = {
  GA4_PROPERTY_ID: '464508343', // Extract from your Measurement ID G-Q30T2S337R
  GA4_API_KEY: process.env.GA4_API_KEY || '', // Set via: export GA4_API_KEY="your-api-key"
  FORMSPREE_FORM_ID: 'xldqywge',
  FORMSPREE_API_KEY: process.env.FORMSPREE_API_KEY || '', // Optional: Get from formspree.io/settings
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

/**
 * Fetch data from Formspree API
 */
async function fetchFormspreeData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'formspree.io',
      port: 443,
      path: `/api/0/forms/${CONFIG.FORMSPREE_FORM_ID}/submissions`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CONFIG.FORMSPREE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 401) {
            // API key not set or invalid - return mock data
            console.log(`${colors.yellow}⚠️  Formspree API key not set. Showing limited data.${colors.reset}`);
            console.log(`${colors.cyan}ℹ️  To get full submission history, set FORMSPREE_API_KEY${colors.reset}\n`);
            resolve({
              total_submissions: '1+',
              recent_submissions: [],
              note: 'Login to formspree.io to view full submission history',
            });
          } else {
            const parsed = JSON.parse(data);
            resolve({
              total_submissions: parsed.submissions?.length || 0,
              recent_submissions: parsed.submissions?.slice(0, 5) || [],
            });
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Fetch data from GA4 Data API
 * Note: This requires OAuth 2.0 setup. For simplicity, we'll show instructions to view in GA4 dashboard.
 */
async function fetchGA4Data() {
  // GA4 Data API requires complex OAuth setup for server-side access
  // For most users, viewing data in GA4 dashboard is simpler

  return {
    note: 'GA4 data available in Google Analytics dashboard',
    dashboard_url: `https://analytics.google.com/analytics/web/#/p${CONFIG.GA4_PROPERTY_ID}/reports/intelligenthome`,
    metrics_to_check: [
      'Total Users (last 7 days)',
      'Total Sessions (last 7 days)',
      'Conversions: generate_lead event',
    ],
  };
}

/**
 * Display dashboard in terminal
 */
function displayDashboard(formspreeData, ga4Data) {
  console.log('\n');
  console.log(`${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}     PropIQ Landing Page Analytics Dashboard${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');

  // Formspree Metrics
  console.log(`${colors.bright}${colors.green}📊 WAITLIST SIGNUPS (Formspree)${colors.reset}`);
  console.log(`${colors.cyan}───────────────────────────────────────────${colors.reset}`);
  console.log(`   Total Submissions: ${colors.bright}${formspreeData.total_submissions}${colors.reset}`);

  if (formspreeData.recent_submissions && formspreeData.recent_submissions.length > 0) {
    console.log(`\n   Recent Signups:`);
    formspreeData.recent_submissions.forEach((sub, i) => {
      const date = new Date(sub.created_at).toLocaleString();
      console.log(`   ${i + 1}. ${sub.email} - ${date}`);
    });
  }

  if (formspreeData.note) {
    console.log(`\n   ${colors.yellow}ℹ️  ${formspreeData.note}${colors.reset}`);
    console.log(`   ${colors.cyan}→ View all submissions: https://formspree.io/forms/${CONFIG.FORMSPREE_FORM_ID}${colors.reset}`);
  }

  console.log('');

  // GA4 Metrics
  console.log(`${colors.bright}${colors.green}📈 TRAFFIC & CONVERSIONS (Google Analytics)${colors.reset}`);
  console.log(`${colors.cyan}───────────────────────────────────────────${colors.reset}`);
  console.log(`   ${colors.yellow}${ga4Data.note}${colors.reset}`);
  console.log(`\n   ${colors.bright}Key Metrics to Check:${colors.reset}`);
  ga4Data.metrics_to_check.forEach((metric, i) => {
    console.log(`   ${i + 1}. ${metric}`);
  });
  console.log(`\n   ${colors.cyan}→ Open GA4 Dashboard:${colors.reset}`);
  console.log(`   ${colors.cyan}  ${ga4Data.dashboard_url}${colors.reset}`);

  console.log('');

  // Quick Actions
  console.log(`${colors.bright}${colors.green}⚡ QUICK ACTIONS${colors.reset}`);
  console.log(`${colors.cyan}───────────────────────────────────────────${colors.reset}`);
  console.log(`   1. View all signups: ${colors.cyan}https://formspree.io/forms/${CONFIG.FORMSPREE_FORM_ID}${colors.reset}`);
  console.log(`   2. View GA4 realtime: ${colors.cyan}https://analytics.google.com/analytics/web/#/p${CONFIG.GA4_PROPERTY_ID}/realtime${colors.reset}`);
  console.log(`   3. View landing page: ${colors.cyan}https://propiq.luntra.one${colors.reset}`);

  console.log('');
  console.log(`${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');
}

/**
 * Export data to CSV
 */
function exportToCSV(formspreeData) {
  const filename = `propiq-signups-${new Date().toISOString().split('T')[0]}.csv`;

  let csv = 'Email,Submitted At\n';

  if (formspreeData.recent_submissions && formspreeData.recent_submissions.length > 0) {
    formspreeData.recent_submissions.forEach(sub => {
      csv += `${sub.email},${sub.created_at}\n`;
    });
  } else {
    csv += 'No data available (API key required)\n';
  }

  fs.writeFileSync(filename, csv);
  console.log(`${colors.green}✅ Exported to: ${filename}${colors.reset}\n`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const shouldExport = args.includes('--export');

  console.log(`${colors.cyan}Fetching analytics data...${colors.reset}`);

  try {
    const [formspreeData, ga4Data] = await Promise.all([
      fetchFormspreeData(),
      fetchGA4Data(),
    ]);

    displayDashboard(formspreeData, ga4Data);

    if (shouldExport) {
      exportToCSV(formspreeData);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error fetching data:${colors.reset}`, error.message);
    console.log('\n');
    console.log(`${colors.yellow}Setup Instructions:${colors.reset}`);
    console.log('1. Get Formspree API key: https://formspree.io/settings');
    console.log('2. Set environment variable: export FORMSPREE_API_KEY="your-key"');
    console.log('3. Re-run this script\n');
  }
}

// Run the dashboard
main();
