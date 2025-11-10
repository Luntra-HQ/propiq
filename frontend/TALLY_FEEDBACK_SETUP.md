# Tally Feedback Form Integration Guide

**Quick setup guide for integrating Tally.so feedback forms into PropIQ**

---

## Step 1: Create Your Tally Form

1. Go to [tally.so](https://tally.so) and sign up (free account is fine)
2. Click "Create new form"
3. Choose "Start from scratch" or use a template

### Recommended Form Fields

Here's the suggested structure for PropIQ feedback:

**Page 1: Rating & Quick Feedback**
- **Question 1:** "How would you rate your PropIQ experience?"
  - Type: Rating (1-5 stars)
  - Required: Yes

- **Question 2:** "What did you find most helpful?"
  - Type: Multiple choice
  - Options:
    - Financial metrics & calculations
    - Market insights
    - Risk assessment
    - Deal scoring
    - Support chat
    - Other (with text input)

**Page 2: Detailed Feedback**
- **Question 3:** "What could we improve?"
  - Type: Long text
  - Required: No
  - Placeholder: "Any bugs, confusing features, or missing functionality?"

- **Question 4:** "Would you recommend PropIQ to others?"
  - Type: NPS scale (0-10)
  - Required: Yes
  - 0-6 = Detractor, 7-8 = Passive, 9-10 = Promoter

**Page 3: Contact (Optional)**
- **Question 5:** "Email (optional - for follow-up)"
  - Type: Email
  - Required: No

**Hidden Fields** (auto-populated from app):
- `user_tier` - User's subscription tier (Free, Starter, Pro, Elite)
- `user_id` - User ID for tracking
- `feedback_source` - Where feedback was submitted (e.g., "post-analysis", "general")

---

## Step 2: Get Your Tally Form ID

After creating your form:
1. Click "Publish" in Tally
2. Copy your form URL: `https://tally.so/r/YOUR_FORM_ID`
3. Your form ID is the part after `/r/` (e.g., `wMeDqP`)

---

## Step 3: Integrate into PropIQ

### Option A: Floating Feedback Button (Recommended)

Add to your main `App.tsx`:

```tsx
import { FeedbackWidget } from './components/FeedbackWidget';

function App() {
  // Get current user info
  const user = useAuth(); // Your existing auth hook

  return (
    <div className="app">
      {/* Your existing app content */}

      {/* Add feedback widget */}
      {user && (
        <FeedbackWidget
          tallyFormId="YOUR_FORM_ID_HERE"
          hiddenFields={{
            user_tier: user.subscriptionTier || 'Free',
            user_id: user.id,
            feedback_source: 'general'
          }}
          position="bottom-right"
        />
      )}
    </div>
  );
}
```

### Option B: Post-Analysis Feedback (Inline Embed)

Add to your property analysis results page:

```tsx
import { FeedbackWidgetInline } from './components/FeedbackWidget';

function PropertyAnalysisResults({ analysis, user }) {
  return (
    <div className="analysis-results">
      {/* Analysis content */}
      <div className="analysis-content">
        {/* ... analysis details ... */}
      </div>

      {/* Inline feedback form */}
      <div className="feedback-section">
        <h3>How was this analysis?</h3>
        <FeedbackWidgetInline
          tallyFormId="YOUR_FORM_ID_HERE"
          hiddenFields={{
            user_tier: user.subscriptionTier,
            user_id: user.id,
            feedback_source: 'post-analysis',
            analysis_id: analysis.id
          }}
          height="400px"
        />
      </div>
    </div>
  );
}
```

---

## Step 4: Configure Form Settings in Tally

### Customization Options

In Tally form settings:

**1. Appearance**
- Theme: Match PropIQ colors (purple gradient: #667eea to #764ba2)
- Button text: "Submit Feedback"
- Success message: "Thanks! Your feedback helps us improve PropIQ."

**2. Notifications**
- Email notifications: Enable to get notified of new feedback
- Slack notifications: Connect to your Slack workspace (optional)
- Webhook: Send to PropIQ backend for processing (optional - see Step 5)

**3. Form Settings**
- Auto-close after submission: 3 seconds (for popup version)
- Allow multiple responses: Yes
- Show Tally branding: Hide (on paid plan) or Keep (on free plan)

---

## Step 5: View Feedback Responses

### In Tally Dashboard

1. Go to your Tally dashboard
2. Click on your feedback form
3. Navigate to "Responses" tab
4. View individual responses or export to CSV/Excel

### Filtering & Analysis

Tally provides:
- **Response count** over time
- **Average ratings** for rating questions
- **NPS score** (calculated automatically)
- **Filter by date** range
- **Search responses** by keyword
- **Export data** to CSV, Excel, or Google Sheets

---

## Step 6: (Optional) Advanced Integration

### Webhook Integration with PropIQ Backend

If you want to automatically process feedback in your backend:

**In Tally:**
1. Go to form settings → Integrations → Webhooks
2. Add webhook URL: `https://luntra-outreach-app.azurewebsites.net/feedback/tally-webhook`
3. Select "On submission" trigger

**In PropIQ Backend:**

Create `propiq/backend/routers/feedback.py`:

```python
from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.post("/tally-webhook")
async def tally_webhook(request: Request):
    """
    Receive feedback submissions from Tally via webhook
    """
    try:
        payload = await request.json()

        # Extract fields from Tally payload
        data = payload.get('data', {})
        fields = data.get('fields', [])

        # Parse feedback
        feedback = {
            'rating': next((f['value'] for f in fields if f['key'] == 'rating'), None),
            'helpful_features': next((f['value'] for f in fields if f['key'] == 'helpful'), None),
            'improvements': next((f['value'] for f in fields if f['key'] == 'improvements'), None),
            'nps_score': next((f['value'] for f in fields if f['key'] == 'nps'), None),
            'user_tier': next((f['value'] for f in fields if f['key'] == 'user_tier'), None),
            'user_id': next((f['value'] for f in fields if f['key'] == 'user_id'), None),
            'submitted_at': data.get('submittedAt'),
        }

        # Store in database
        # db.feedback.insert_one(feedback)

        # (Optional) Run feedback synthesizer agent here
        # await synthesize_feedback(feedback)

        print(f"Feedback received: {feedback}")

        return {"status": "success"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Customization Options

### Button Position

Change the floating button position:

```tsx
<FeedbackWidget
  position="bottom-left"  // Options: bottom-right, bottom-left, top-right, top-left
/>
```

### Button Styling

Edit `FeedbackWidget.css` to match your brand:

```css
.feedback-widget-button {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
  /* Customize colors, size, shadow, etc. */
}
```

### Hidden Fields

Pass any data you want to track:

```tsx
hiddenFields={{
  user_tier: 'Pro',
  user_id: '12345',
  feedback_source: 'post-analysis',
  analysis_id: 'abc123',
  property_address: '123 Main St',
  subscription_status: 'active'
}}
```

---

## Monitoring Feedback

### Weekly Review Process

1. **Monday mornings:** Review new feedback in Tally dashboard
2. **Calculate NPS:** Track Net Promoter Score trend
3. **Categorize issues:**
   - Bugs → Create GitHub issues
   - Feature requests → Add to product roadmap
   - Positive feedback → Share with team
4. **Follow up:** Email users who left contact info
5. **Track trends:** Look for patterns in feedback

### Key Metrics to Track

- **Response rate:** % of users submitting feedback
- **Average rating:** Track over time (goal: 4+ stars)
- **NPS score:** Net Promoter Score (goal: 50+)
- **Top complaints:** Most mentioned issues
- **Top features:** Most loved features
- **Improvement trends:** Is feedback getting more positive?

---

## Integration Checklist

Before going live:

- [ ] Created Tally form with recommended fields
- [ ] Tested form submission manually
- [ ] Configured hidden fields to pass user data
- [ ] Added `FeedbackWidget.tsx` component to PropIQ
- [ ] Imported component in `App.tsx`
- [ ] Replaced `YOUR_FORM_ID_HERE` with actual Tally form ID
- [ ] Tested popup opens correctly
- [ ] Tested form submission in dev environment
- [ ] Verified hidden fields are populated correctly
- [ ] Set up email notifications in Tally
- [ ] Configured form appearance to match PropIQ brand
- [ ] Tested on mobile devices
- [ ] Added to production build

---

## Troubleshooting

### Problem: Tally popup doesn't open

**Solution:**
- Check that Tally script is loaded: Look for `<script src="https://tally.so/widgets/embed.js">` in DevTools
- Check console for errors
- Verify form ID is correct
- Try opening form URL directly: `https://tally.so/r/YOUR_FORM_ID`

### Problem: Hidden fields not populating

**Solution:**
- Check that field names in Tally match the keys in `hiddenFields` prop
- In Tally form builder, add hidden fields with exact same names
- Verify data is being passed: `console.log(hiddenFields)`

### Problem: Form style doesn't match PropIQ

**Solution:**
- In Tally form settings → Design
- Set custom colors to match PropIQ brand
- Use CSS customization (Tally paid feature) for advanced styling

---

## Next Steps: Feedback Synthesizer Agent

Once you have feedback data flowing in, you can build the **Feedback Synthesizer Agent** to automatically:

1. **Analyze sentiment** - Classify feedback as positive/neutral/negative
2. **Extract themes** - Identify common topics and requests
3. **Prioritize issues** - Rank bugs and features by impact
4. **Generate insights** - Weekly summary reports
5. **Auto-respond** - Thank users and acknowledge issues

This can be built following the existing `property_advisor_multiagent.py` pattern.

---

## Cost

**Tally Pricing:**
- **Free:** Unlimited forms, unlimited responses (with Tally branding)
- **Pro ($29/mo):** Remove branding, custom domains, file uploads
- **Business ($99/mo):** Advanced features, priority support

**Recommendation:** Start with free plan, upgrade to Pro if you want to remove Tally branding.

---

## Resources

- [Tally Documentation](https://tally.so/help)
- [Tally Embed Guide](https://tally.so/help/embed-your-form)
- [Tally Developer Resources](https://tally.so/help/developer-resources)
- [React Integration Examples](https://github.com/nititech/react-tally)

---

**Last Updated:** 2025-10-25
**PropIQ Version:** 1.0.0
**Tally Integration:** Ready for deployment
