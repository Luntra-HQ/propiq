/**
 * Resend Configuration Checker
 *
 * Verifies Resend API configuration and domain status.
 * Checks that domain is verified and ready to send emails.
 *
 * Usage: npx tsx scripts/check-resend-config.ts
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EXPECTED_DOMAIN = 'propiq.luntra.one';

if (!RESEND_API_KEY) {
  console.error('❌ Error: RESEND_API_KEY environment variable not set');
  console.log('\nPlease set RESEND_API_KEY in your environment or .env file\n');
  process.exit(1);
}

console.log('🔍 Checking Resend Configuration');
console.log('='.repeat(80));
console.log(`API Key: ${RESEND_API_KEY.substring(0, 10)}...${RESEND_API_KEY.substring(RESEND_API_KEY.length - 4)}`);
console.log(`Expected Domain: ${EXPECTED_DOMAIN}`);
console.log('='.repeat(80) + '\n');

interface ResendDomain {
  id: string;
  name: string;
  status: string;
  created_at: string;
  region: string;
  records?: Array<{
    record: string;
    name: string;
    type: string;
    priority?: number;
    value: string;
    status?: string;
  }>;
}

async function checkResendDomains() {
  console.log('📋 Step 1: Fetching configured domains...\n');

  try {
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Resend API error: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return;
    }

    const data = await response.json();
    const domains: ResendDomain[] = data.data || [];

    if (domains.length === 0) {
      console.log('⚠️  No domains configured in Resend');
      console.log('\nPlease add your domain:');
      console.log('1. Go to: https://resend.com/domains');
      console.log('2. Click "Add Domain"');
      console.log(`3. Enter: ${EXPECTED_DOMAIN}`);
      console.log('4. Follow DNS configuration instructions\n');
      return;
    }

    console.log(`✅ Found ${domains.length} configured domain(s):\n`);

    domains.forEach((domain, index) => {
      console.log(`${index + 1}. Domain: ${domain.name}`);
      console.log(`   ID: ${domain.id}`);
      console.log(`   Status: ${domain.status}`);
      console.log(`   Region: ${domain.region}`);
      console.log(`   Created: ${new Date(domain.created_at).toLocaleString()}`);

      if (domain.name === EXPECTED_DOMAIN) {
        console.log(`   ✅ MATCHES EXPECTED DOMAIN`);
      }

      console.log('');
    });

    // Check if expected domain exists
    const expectedDomain = domains.find(d => d.name === EXPECTED_DOMAIN);

    if (!expectedDomain) {
      console.log('⚠️  Expected domain not found');
      console.log(`\nPlease add domain: ${EXPECTED_DOMAIN}`);
      console.log('Go to: https://resend.com/domains\n');
      return;
    }

    // Check domain status
    console.log('='.repeat(80));
    console.log(`📊 Domain Status: ${EXPECTED_DOMAIN}`);
    console.log('='.repeat(80) + '\n');

    if (expectedDomain.status === 'verified') {
      console.log('✅ Domain is VERIFIED and ready to send emails\n');
    } else if (expectedDomain.status === 'not_started') {
      console.log('⚠️  Domain verification NOT STARTED');
      console.log('\nPlease configure DNS records:\n');
      await showDNSRecords(expectedDomain.id);
    } else if (expectedDomain.status === 'pending') {
      console.log('⏳ Domain verification PENDING');
      console.log('\nDNS records may still be propagating (can take up to 48 hours)');
      console.log('Current DNS records:\n');
      await showDNSRecords(expectedDomain.id);
    } else if (expectedDomain.status === 'failed') {
      console.log('❌ Domain verification FAILED');
      console.log('\nPlease check DNS records:\n');
      await showDNSRecords(expectedDomain.id);
    }

    console.log('='.repeat(80));
    console.log('✅ Configuration Check Complete');
    console.log('='.repeat(80) + '\n');

    if (expectedDomain.status === 'verified') {
      console.log('🎉 Your domain is ready to send emails!');
      console.log('\nNext steps:');
      console.log('1. Test email delivery: npx tsx scripts/test-real-email-delivery.ts your-email@example.com');
      console.log('2. Check Resend logs: https://resend.com/emails');
      console.log('3. Monitor delivery rates and spam complaints\n');
    } else {
      console.log('⚠️  Domain not fully verified yet');
      console.log('\nNext steps:');
      console.log('1. Add/update DNS records as shown above');
      console.log('2. Wait for DNS propagation (up to 48 hours)');
      console.log('3. Re-run this script to check status');
      console.log('4. Once verified, test email delivery\n');
    }

  } catch (error: any) {
    console.error('❌ Error fetching domains:', error.message);
    console.log('\nPlease check:');
    console.log('1. RESEND_API_KEY is valid');
    console.log('2. Internet connection is active');
    console.log('3. Resend API is accessible\n');
  }
}

async function showDNSRecords(domainId: string) {
  try {
    const response = await fetch(`https://api.resend.com/domains/${domainId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Error fetching DNS records: ${response.status}`);
      return;
    }

    const domain: ResendDomain = await response.json();

    if (!domain.records || domain.records.length === 0) {
      console.log('⚠️  No DNS records found\n');
      return;
    }

    console.log('DNS Records to Add:\n');

    domain.records.forEach((record, index) => {
      console.log(`${index + 1}. ${record.record} (${record.type})`);
      console.log(`   Name: ${record.name}`);
      console.log(`   Type: ${record.type}`);
      if (record.priority) {
        console.log(`   Priority: ${record.priority}`);
      }
      console.log(`   Value: ${record.value}`);
      if (record.status) {
        console.log(`   Status: ${record.status}`);
      }
      console.log('');
    });

    console.log('How to add DNS records:');
    console.log('1. Login to your DNS provider (e.g., Cloudflare, GoDaddy, etc.)');
    console.log('2. Go to DNS management for luntra.one');
    console.log('3. Add each record shown above');
    console.log('4. Wait for DNS propagation (5 minutes to 48 hours)');
    console.log('5. Resend will automatically verify when records are detected\n');

  } catch (error: any) {
    console.error('❌ Error fetching DNS records:', error.message);
  }
}

// Run checks
checkResendDomains().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
