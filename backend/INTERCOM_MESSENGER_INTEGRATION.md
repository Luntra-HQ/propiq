# Intercom Messenger Integration Guide

## Overview
Intercom Messenger is a customer messaging widget that provides:
- **Live Chat**: Real-time support conversations
- **Product Tours**: Guide users through features
- **In-App Messages**: Targeted messages based on user behavior
- **Help Center**: Self-service knowledge base
- **User Profiles**: Track customer history and context

**Frontend-only integration** - the Messenger widget runs entirely in the browser.

---

## Setup Instructions

### 1. Intercom Account ✅ CONFIGURED
- App ID: **hvhctgls**
- Workspace: https://app.intercom.com/
- Status: Ready for frontend integration
- Installation Type: For logged-in users (recommended)

### 2. Frontend Integration (React)

#### Step 1: Install the Intercom SDK

```bash
cd luntra/frontend
npm install @intercom/messenger-js-sdk
```

#### Step 2: Create Intercom Utility

Create a new file for Intercom initialization:

```typescript
// src/utils/intercom.ts
import Intercom from '@intercom/messenger-js-sdk';

export interface IntercomUser {
  user_id: string;
  email: string;
  name?: string;
  created_at?: number;  // Unix timestamp in seconds
  subscription_tier?: string;
  trial_analyses_remaining?: number;
}

/**
 * Initialize Intercom Messenger with user data
 *
 * Call this after user logs in or on app mount for authenticated users
 */
export const initIntercom = (user: IntercomUser) => {
  // Only initialize in production or when explicitly enabled
  const intercomEnabled = import.meta.env.PROD || import.meta.env.VITE_INTERCOM_ENABLED === 'true';

  if (!intercomEnabled) {
    console.log('Intercom disabled in development');
    return;
  }

  Intercom({
    app_id: 'hvhctgls',  // PropIQ Intercom App ID
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,

    // Custom attributes for PropIQ
    custom_attributes: {
      subscription_tier: user.subscription_tier || 'free',
      trial_analyses_remaining: user.trial_analyses_remaining || 0,
    }
  });

  console.log('✅ Intercom Messenger initialized for:', user.email);
};

/**
 * Update Intercom with new user data
 *
 * Call this when user attributes change (e.g., subscription upgrade)
 */
export const updateIntercomUser = (updates: Partial<IntercomUser>) => {
  if (typeof window.Intercom === 'function') {
    window.Intercom('update', updates);
  }
};

/**
 * Track a custom event in Intercom
 *
 * Examples:
 * - trackIntercomEvent('property_analyzed', { address: '123 Main St', recommendation: 'buy' })
 * - trackIntercomEvent('subscription_upgraded', { from: 'free', to: 'starter' })
 */
export const trackIntercomEvent = (eventName: string, metadata?: Record<string, any>) => {
  if (typeof window.Intercom === 'function') {
    window.Intercom('trackEvent', eventName, metadata);
  }
};

/**
 * Show the Intercom Messenger
 */
export const showIntercom = () => {
  if (typeof window.Intercom === 'function') {
    window.Intercom('show');
  }
};

/**
 * Hide the Intercom Messenger
 */
export const hideIntercom = () => {
  if (typeof window.Intercom === 'function') {
    window.Intercom('hide');
  }
};

/**
 * Shutdown Intercom on logout
 */
export const shutdownIntercom = () => {
  if (typeof window.Intercom === 'function') {
    window.Intercom('shutdown');
    console.log('✅ Intercom Messenger shut down');
  }
};

// TypeScript declaration for window.Intercom
declare global {
  interface Window {
    Intercom?: any;
  }
}
```

#### Step 3: Initialize on User Login

Update your authentication flow to initialize Intercom after login:

```typescript
// src/App.tsx or src/components/Auth/Login.tsx
import { initIntercom, shutdownIntercom } from './utils/intercom';

// After successful login
const handleLoginSuccess = (user: User, token: string) => {
  // Store token
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  // Initialize Intercom with user data
  initIntercom({
    user_id: user.id,
    email: user.email,
    name: user.full_name,
    created_at: Math.floor(new Date(user.created_at).getTime() / 1000),  // Convert to Unix timestamp
    subscription_tier: user.subscription_tier,
    trial_analyses_remaining: user.trial_analyses_remaining
  });

  navigate('/dashboard');
};

// On logout
const handleLogout = () => {
  // Shutdown Intercom
  shutdownIntercom();

  // Clear auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/login');
};
```

#### Step 4: Initialize on App Mount (Persistent Login)

If user is already logged in, initialize Intercom on app mount:

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { initIntercom } from './utils/intercom';

function App() {
  useEffect(() => {
    // Check if user is already logged in
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);

        // Re-initialize Intercom for returning user
        initIntercom({
          user_id: user.id,
          email: user.email,
          name: user.full_name,
          created_at: Math.floor(new Date(user.created_at).getTime() / 1000),
          subscription_tier: user.subscription_tier,
          trial_analyses_remaining: user.trial_analyses_remaining
        });
      } catch (error) {
        console.error('Failed to initialize Intercom:', error);
      }
    }
  }, []);

  return (
    <Router>
      {/* Your app routes */}
    </Router>
  );
}
```

---

## Environment Variables

Add to your frontend `.env` files:

```bash
# .env.development
VITE_INTERCOM_ENABLED=false  # Disable in dev to avoid test data

# .env.production
VITE_INTERCOM_ENABLED=true   # Enable in production
```

---

## PropIQ-Specific Integration Points

### 1. Property Analysis Tracking

Track when users analyze properties:

```typescript
// After successful property analysis
import { trackIntercomEvent } from '@/utils/intercom';

const handleAnalysisComplete = (analysis: PropertyAnalysis) => {
  trackIntercomEvent('property_analyzed', {
    address: analysis.address,
    recommendation: analysis.investment.recommendation,
    confidence_score: analysis.investment.confidenceScore,
    cap_rate: analysis.financials.capRate,
    roi: analysis.financials.roi
  });
};
```

### 2. Subscription Upgrade Tracking

Track subscription changes:

```typescript
// After successful subscription upgrade
import { updateIntercomUser, trackIntercomEvent } from '@/utils/intercom';

const handleSubscriptionUpgrade = (oldTier: string, newTier: string) => {
  // Update user attributes
  updateIntercomUser({
    custom_attributes: {
      subscription_tier: newTier,
      previous_tier: oldTier,
      upgraded_at: Math.floor(Date.now() / 1000)
    }
  });

  // Track upgrade event
  trackIntercomEvent('subscription_upgraded', {
    from_tier: oldTier,
    to_tier: newTier,
    timestamp: new Date().toISOString()
  });
};
```

### 3. Trial Usage Tracking

Update trial count as it decreases:

```typescript
// After using a trial analysis
import { updateIntercomUser } from '@/utils/intercom';

const handleTrialAnalysisUsed = (analysesRemaining: number) => {
  updateIntercomUser({
    custom_attributes: {
      trial_analyses_remaining: analysesRemaining
    }
  });

  // Show Intercom message when running low
  if (analysesRemaining === 1) {
    showIntercom();  // Prompt user to upgrade
  }
};
```

### 4. Help Button Integration

Add custom help button that opens Intercom:

```typescript
// src/components/HelpButton.tsx
import { showIntercom } from '@/utils/intercom';

export const HelpButton = () => {
  return (
    <button
      onClick={showIntercom}
      className="help-button"
      aria-label="Get help"
    >
      <ChatIcon />
      Need Help?
    </button>
  );
};
```

---

## Intercom Features to Enable

### 1. Product Tours
Create tours for new users:
- First property analysis walkthrough
- Subscription tier explanations
- Dashboard feature overview

### 2. Triggered Messages
Set up automatic messages based on behavior:
- Welcome message after signup
- Help offer after 3 failed analyses
- Upgrade prompt when trial analyses = 0
- Re-engagement for inactive users (7+ days)

### 3. Help Center Articles
Create articles for common questions:
- How to analyze a property
- Understanding analysis recommendations
- Subscription tier comparison
- Payment and billing FAQs

### 4. Custom Bots
Set up bots for common queries:
- Pricing questions → Link to pricing page
- Technical support → Collect details and create ticket
- Feature requests → Route to product team

---

## Testing Your Integration

### 1. Verify Installation

After deploying, check:

```javascript
// In browser console
window.Intercom  // Should be defined

// Check Intercom is initialized
window.Intercom('getVisitorId')  // Should return visitor ID
```

### 2. Test User Identification

Log in with a test account and verify in Intercom dashboard:
1. Go to https://app.intercom.com/a/inbox/
2. Click "Users" in left sidebar
3. Search for your test user email
4. Verify user attributes are correct:
   - Name
   - Email
   - Subscription tier
   - Trial analyses remaining

### 3. Test Event Tracking

Perform actions in your app:
1. Analyze a property
2. Check Intercom user profile
3. Verify "property_analyzed" event appears in timeline

### 4. Test Messenger Visibility

The Messenger should:
- Appear in bottom-right corner after login
- Show user's name in header
- Display conversation history
- Load Help Center articles

---

## Customization

### Color and Branding

Customize Messenger appearance in Intercom settings:
1. Go to https://app.intercom.com/a/apps/hvhctgls/settings/messenger
2. Set colors to match PropIQ brand:
   - Primary color: Your brand color
   - Action color: Call-to-action color
3. Upload PropIQ logo
4. Customize header text

### Messenger Launcher Position

Change position in settings or via code:

```typescript
Intercom({
  app_id: 'hvhctgls',
  // ... user data
  alignment: 'right',  // or 'left'
  horizontal_padding: 20,
  vertical_padding: 20
});
```

### Hide Messenger on Specific Pages

```typescript
// On pricing page (to avoid distraction)
useEffect(() => {
  if (location.pathname === '/pricing') {
    hideIntercom();
  }

  return () => {
    showIntercom();  // Show again when leaving page
  };
}, [location.pathname]);
```

---

## Privacy & Data Protection

### User Data Collected
Intercom will store:
- User ID, email, name
- Custom attributes (subscription tier, etc.)
- Conversation history
- Events tracked (property_analyzed, etc.)
- Device and browser info

### GDPR Compliance

**User Consent**: Add consent checkbox to signup form:

```typescript
const [intercomConsent, setIntercomConsent] = useState(false);

<label>
  <input
    type="checkbox"
    checked={intercomConsent}
    onChange={(e) => setIntercomConsent(e.target.checked)}
  />
  I agree to receive support messages via Intercom
</label>

// Only initialize if consented
if (intercomConsent) {
  initIntercom(user);
}
```

**Data Deletion**: Implement user data deletion:

```typescript
// When user deletes account
const deleteUserData = async (userId: string) => {
  // Delete from your database
  await deleteUser(userId);

  // Delete from Intercom via API (backend)
  await fetch('/intercom/delete-user', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ user_id: userId })
  });
};
```

---

## Troubleshooting

### Messenger Not Appearing

**Check**:
- User is logged in
- App ID is correct (hvhctgls)
- Intercom is enabled in environment
- No JavaScript errors in console
- Intercom is showing in settings: https://app.intercom.com/a/apps/hvhctgls/settings/messenger

### Events Not Tracking

**Check**:
- User is identified (window.Intercom is defined)
- Event names match exactly (case-sensitive)
- Events appear in Intercom user timeline
- No errors in browser console

### User Attributes Not Updating

**Check**:
- Calling `updateIntercomUser()` with correct data
- Attributes are under `custom_attributes` key
- Checking correct user in Intercom dashboard
- Refreshing Intercom dashboard after update

---

## Backend Integration

For backend webhook handling and server-side events, see:
- `routers/intercom.py` - Webhook handler and API integration
- Backend already has helper functions:
  - `notify_user_signup()` - Track new signups
  - `notify_property_analysis()` - Track property analyses
  - `notify_subscription_change()` - Track subscription upgrades

Backend credentials needed (get from Intercom settings):
- **Access Token**: For API calls to create/update users
- **Webhook Secret**: For verifying webhook signatures

Get these from: https://app.intercom.com/a/apps/hvhctgls/settings/developers

---

## Cost

**Intercom Pricing**:
- Free tier: 14-day trial
- Paid plans start at $74/month (Support + Engage)
- Pricing scales with active users

**Recommendations for PropIQ**:
- Start with free trial to test integration
- Monitor active user count
- Consider "Start" plan ($74/mo) for up to 1,000 users
- Upgrade as user base grows

---

## Next Steps

1. ✅ Intercom account created - App ID: **hvhctgls**
2. Install npm package: `npm install @intercom/messenger-js-sdk`
3. Create `src/utils/intercom.ts` (copy code from Step 2 above)
4. Initialize on login (see Step 3)
5. Initialize on app mount (see Step 4)
6. Add event tracking for property analysis and subscriptions
7. Test in staging environment
8. Deploy to production
9. Monitor user engagement in Intercom dashboard

---

## Resources

- Intercom Dashboard: https://app.intercom.com/a/apps/hvhctgls
- Messenger Settings: https://app.intercom.com/a/apps/hvhctgls/settings/messenger
- Developer Docs: https://developers.intercom.com/installing-intercom/docs/intercom-javascript
- React SDK: https://www.npmjs.com/package/@intercom/messenger-js-sdk
- API Reference: https://developers.intercom.com/intercom-api-reference/reference

---

## Support

Need help with Intercom integration? Contact:
- Intercom Support: https://www.intercom.com/help
- PropIQ Backend Team: Check `routers/intercom.py` for backend integration
