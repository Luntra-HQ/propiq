#!/usr/bin/env node

/**
 * PropIQ Issue Tracker Sync Script
 *
 * Bidirectionally syncs between:
 * - Local CSV file (PROPIQ_BUG_TRACKER.csv)
 * - GitHub Issues (via gh CLI)
 *
 * Usage:
 *   node scripts/sync-issue-tracker.js [command]
 *
 * Commands:
 *   push       - Push local CSV changes to GitHub Issues
 *   pull       - Pull GitHub Issues to local CSV
 *   sync       - Bidirectional sync (default)
 *   export     - Export all GitHub issues to CSV
 *
 * Requirements:
 *   - gh CLI installed and authenticated
 *   - Node.js 16+
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  csvPath: path.join(__dirname, '../PROPIQ_BUG_TRACKER.csv'),
  repo: 'Luntra-HQ/propiq',
  labels: {
    bug: 'bug',
    feature: 'enhancement',
    critical: 'p0-critical',
    high: 'p1-high',
    medium: 'p2-medium',
    low: 'p3-low'
  }
};

// CSV Column mapping
const CSV_COLUMNS = [
  'Bug ID',
  'GitHub Issue',
  'Date First Reported',
  'Date Last Reported',
  'Occurrences',
  'Error Type',
  'Error Message',
  'Component',
  'User Impact',
  'Root Cause',
  'Status',
  'Fix Commit',
  'Resolution Date',
  'Files Affected',
  'Notes'
];

/**
 * Execute shell command and return output
 */
function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return null;
  }
}

/**
 * Parse CSV file into array of objects
 */
function parseCSV(csvPath) {
  if (!fs.existsSync(csvPath)) {
    console.log(`CSV file not found: ${csvPath}`);
    return [];
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1);

  return rows.map(row => {
    // Handle CSV with quoted fields containing commas
    const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const obj = {};

    headers.forEach((header, i) => {
      obj[header] = values[i] ? values[i].replace(/^"|"$/g, '').trim() : '';
    });

    return obj;
  });
}

/**
 * Write array of objects to CSV file
 */
function writeCSV(csvPath, data) {
  if (data.length === 0) {
    console.log('No data to write to CSV');
    return;
  }

  const headers = CSV_COLUMNS;
  const rows = data.map(row => {
    return CSV_COLUMNS.map(col => {
      const value = row[col] || '';
      // Quote fields that contain commas
      return value.includes(',') ? `"${value}"` : value;
    }).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(csvPath, csv + '\n', 'utf8');
  console.log(`✅ Wrote ${data.length} records to ${csvPath}`);
}

/**
 * Fetch all GitHub issues
 */
function fetchGitHubIssues() {
  console.log('📥 Fetching GitHub issues...');

  const command = `gh issue list --repo ${CONFIG.repo} --limit 1000 --state all --json number,title,labels,state,body,createdAt,updatedAt,closedAt`;
  const output = exec(command);

  if (!output) {
    console.error('Failed to fetch GitHub issues');
    return [];
  }

  try {
    return JSON.parse(output);
  } catch (error) {
    console.error('Failed to parse GitHub issues JSON');
    return [];
  }
}

/**
 * Create GitHub issue from CSV record
 */
function createGitHubIssue(record) {
  const title = record['Error Type'] || 'Bug Report';
  const severity = record['User Impact']?.toLowerCase() || 'medium';

  let labels = [CONFIG.labels.bug];
  if (severity.includes('critical')) labels.push(CONFIG.labels.critical);
  else if (severity.includes('high')) labels.push(CONFIG.labels.high);
  else if (severity.includes('medium')) labels.push(CONFIG.labels.medium);
  else labels.push(CONFIG.labels.low);

  const body = `
## Bug Details

**Error Message:** ${record['Error Message'] || 'N/A'}

**Component:** ${record['Component'] || 'N/A'}

**User Impact:** ${record['User Impact'] || 'N/A'}

**Root Cause:** ${record['Root Cause'] || 'Under investigation'}

**Files Affected:** ${record['Files Affected'] || 'N/A'}

**Status:** ${record['Status'] || 'Open'}

**Fix Commit:** ${record['Fix Commit'] || 'N/A'}

**Notes:** ${record['Notes'] || 'N/A'}

---

**Tracking Info:**
- Bug ID: ${record['Bug ID']}
- First Reported: ${record['Date First Reported']}
- Last Reported: ${record['Date Last Reported']}
- Occurrences: ${record['Occurrences'] || '1'}

---
*Auto-synced from local CSV tracker*
  `.trim();

  const command = `gh issue create --repo ${CONFIG.repo} --title "${title}" --body "${body.replace(/"/g, '\\"')}" --label "${labels.join(',')}"`;

  const output = exec(command);

  if (output && output.includes('https://github.com')) {
    const issueUrl = output.trim();
    const issueNumber = issueUrl.split('/').pop();
    console.log(`✅ Created GitHub issue #${issueNumber}`);
    return issueNumber;
  }

  return null;
}

/**
 * Update GitHub issue from CSV record
 */
function updateGitHubIssue(issueNumber, record) {
  const body = `
## Bug Details

**Error Message:** ${record['Error Message'] || 'N/A'}

**Component:** ${record['Component'] || 'N/A'}

**User Impact:** ${record['User Impact'] || 'N/A'}

**Root Cause:** ${record['Root Cause'] || 'Under investigation'}

**Files Affected:** ${record['Files Affected'] || 'N/A'}

**Status:** ${record['Status'] || 'Open'}

**Fix Commit:** ${record['Fix Commit'] || 'N/A'}

**Notes:** ${record['Notes'] || 'N/A'}

---

**Tracking Info:**
- Bug ID: ${record['Bug ID']}
- First Reported: ${record['Date First Reported']}
- Last Reported: ${record['Date Last Reported']}
- Occurrences: ${record['Occurrences'] || '1'}
- Resolution Date: ${record['Resolution Date'] || 'N/A'}

---
*Auto-synced from local CSV tracker*
  `.trim();

  const command = `gh issue edit ${issueNumber} --repo ${CONFIG.repo} --body "${body.replace(/"/g, '\\"')}"`;

  exec(command);
  console.log(`✅ Updated GitHub issue #${issueNumber}`);

  // Close issue if status is FIXED
  if (record['Status']?.toUpperCase() === 'FIXED') {
    exec(`gh issue close ${issueNumber} --repo ${CONFIG.repo} --comment "Fixed in commit ${record['Fix Commit']}"`);
    console.log(`✅ Closed GitHub issue #${issueNumber}`);
  }
}

/**
 * Convert GitHub issue to CSV record
 */
function githubIssueToCSV(issue) {
  const labels = issue.labels.map(l => l.name).join(', ');
  const isBug = labels.includes('bug');

  if (!isBug) return null; // Only sync bugs

  // Parse body for structured data
  const body = issue.body || '';
  const extract = (field) => {
    const match = body.match(new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+?)(?=\\n|$)`, 'i'));
    return match ? match[1].trim() : '';
  };

  return {
    'Bug ID': `BUG-${String(issue.number).padStart(3, '0')}`,
    'GitHub Issue': `#${issue.number}`,
    'Date First Reported': issue.createdAt.split('T')[0],
    'Date Last Reported': issue.updatedAt.split('T')[0],
    'Occurrences': extract('Occurrences') || '1',
    'Error Type': issue.title,
    'Error Message': extract('Error Message'),
    'Component': extract('Component'),
    'User Impact': extract('User Impact'),
    'Root Cause': extract('Root Cause'),
    'Status': issue.state === 'OPEN' ? 'INVESTIGATING' : 'FIXED',
    'Fix Commit': extract('Fix Commit'),
    'Resolution Date': issue.closedAt ? issue.closedAt.split('T')[0] : '',
    'Files Affected': extract('Files Affected'),
    'Notes': extract('Notes')
  };
}

/**
 * Push local CSV changes to GitHub
 */
function pushToGitHub() {
  console.log('\n📤 PUSH: Local CSV → GitHub Issues');
  console.log('─'.repeat(50));

  const localRecords = parseCSV(CONFIG.csvPath);
  const githubIssues = fetchGitHubIssues();

  if (localRecords.length === 0) {
    console.log('⚠️  No local records found in CSV');
    return;
  }

  localRecords.forEach(record => {
    const issueNumber = record['GitHub Issue']?.replace('#', '');

    if (issueNumber) {
      // Update existing issue
      const existingIssue = githubIssues.find(i => i.number === parseInt(issueNumber));
      if (existingIssue) {
        updateGitHubIssue(issueNumber, record);
      } else {
        console.log(`⚠️  GitHub issue #${issueNumber} not found, creating new one...`);
        const newIssueNumber = createGitHubIssue(record);
        if (newIssueNumber) {
          record['GitHub Issue'] = `#${newIssueNumber}`;
        }
      }
    } else {
      // Create new issue
      const newIssueNumber = createGitHubIssue(record);
      if (newIssueNumber) {
        record['GitHub Issue'] = `#${newIssueNumber}`;
      }
    }
  });

  // Write back updated CSV with GitHub issue numbers
  writeCSV(CONFIG.csvPath, localRecords);
}

/**
 * Pull GitHub issues to local CSV
 */
function pullFromGitHub() {
  console.log('\n📥 PULL: GitHub Issues → Local CSV');
  console.log('─'.repeat(50));

  const githubIssues = fetchGitHubIssues();
  const localRecords = parseCSV(CONFIG.csvPath);

  if (githubIssues.length === 0) {
    console.log('⚠️  No GitHub issues found');
    return;
  }

  const csvRecords = githubIssues
    .map(issue => githubIssueToCSV(issue))
    .filter(record => record !== null);

  // Merge with existing local records (keep local data if more detailed)
  const merged = csvRecords.map(ghRecord => {
    const localRecord = localRecords.find(lr => lr['GitHub Issue'] === ghRecord['GitHub Issue']);

    if (localRecord) {
      // Merge: prefer local data for detailed fields, GitHub for status/dates
      return {
        ...localRecord,
        'Status': ghRecord['Status'], // GitHub is source of truth for status
        'Date Last Reported': ghRecord['Date Last Reported']
      };
    }

    return ghRecord;
  });

  writeCSV(CONFIG.csvPath, merged);
  console.log(`✅ Pulled ${csvRecords.length} bug issues from GitHub`);
}

/**
 * Bidirectional sync
 */
function sync() {
  console.log('\n🔄 SYNC: Bidirectional sync started');
  console.log('='.repeat(50));

  pushToGitHub();
  pullFromGitHub();

  console.log('\n✅ Sync complete!');
}

/**
 * Export all GitHub issues to CSV
 */
function exportToCSV() {
  console.log('\n📊 EXPORT: All GitHub Issues → CSV');
  console.log('─'.repeat(50));

  pullFromGitHub();
}

// Main execution
const command = process.argv[2] || 'sync';

switch (command) {
  case 'push':
    pushToGitHub();
    break;
  case 'pull':
    pullFromGitHub();
    break;
  case 'sync':
    sync();
    break;
  case 'export':
    exportToCSV();
    break;
  default:
    console.log(`
📋 PropIQ Issue Tracker Sync

Usage: node scripts/sync-issue-tracker.js [command]

Commands:
  push       Push local CSV changes to GitHub Issues
  pull       Pull GitHub Issues to local CSV
  sync       Bidirectional sync (default)
  export     Export all GitHub issues to CSV

Examples:
  node scripts/sync-issue-tracker.js sync
  node scripts/sync-issue-tracker.js push
  node scripts/sync-issue-tracker.js pull
    `);
}
