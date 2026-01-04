# PropIQ Real User Outreach Plan - January 2026

**Reality Check:** You don't have 137 users. You have **2 real users** (+ 1 friend).

---

## 📊 Actual User Breakdown

### ✅ Real Users: 2
1. **Adonis Jackson** - soldbyadonis@gmail.com
   - Company: "Sold By Adonis" (Real estate agent)
   - Signed up: Dec 11, 2025
   - Status: Never ran an analysis
   - Logins: 1

2. **James Marston** - anudesarmes@gmail.com
   - Signed up: Dec 12, 2025
   - Status: Never ran an analysis
   - Logins: 2 (came back!)

### 👥 Friends/Family: 1
3. **Keanu Lamarre** - keanulamarre@gmail.com
   - Status: Only person who actually used the product (1 analysis)
   - Still on free tier

### ❌ Missing: Your Core Network
- **Rob** - Not in database
- **Tom** - Not in database
- **Adam** - Not in database

### 🧪 Database Pollution
- 119 test accounts (86.9%)
- 5 personal accounts (your various emails)
- 8 suspicious accounts (likely more test data)

---

## 🎯 January Outreach Strategy

Since you only have 2 real users (both inactive), this is NOT a conversion problem - it's a **distribution + activation problem**.

### Phase 1: Learn from Your Only Users (This Week)

#### **Action 1: Personal outreach to Adonis Jackson** ⭐ HIGHEST PRIORITY

**Why:** Real estate agent with his own business. If he signed up, he has a need.

**Email Template:**
```
Subject: Adonis - quick question about PropIQ

Hi Adonis,

I saw you signed up for PropIQ in December but haven't run your first analysis yet.

As a fellow real estate person, I'm curious - what were you hoping PropIQ would help you with? And what got in the way of trying it?

I'm the founder and would love 10 minutes on the phone to understand what would make this useful for your business at Sold By Adonis.

My calendar: [Calendly link]
Or just reply with a time that works.

Thanks,
Brian Dusape
Founder, PropIQ
propiq.com
```

**Follow-up (if no response in 3 days):**
```
Subject: Re: Adonis - quick question about PropIQ

Hi Adonis,

Following up on my email from [date]. I know you're busy, so I'll keep this short:

I'd love 10 minutes to understand what you were looking for when you signed up for PropIQ. Your feedback would help me build something actually useful for agents like you.

Would [Tuesday at 2pm] or [Wednesday at 10am] work for a quick call?

Thanks,
Brian
```

---

#### **Action 2: Personal outreach to James Marston**

**Why:** Logged in twice (shows intent), but didn't activate. Understanding the blocker is critical.

**Email Template:**
```
Subject: James - saw you logged in twice to PropIQ

Hi James,

I noticed you logged into PropIQ twice in December but didn't run an analysis.

I'm the founder, and I'd love to know:
1. What were you looking for when you signed up?
2. What stopped you from analyzing a property?

Can I call you for 10 minutes to understand how to make this better?

Reply with a time or grab a slot here: [Calendly link]

Best,
Brian Dusape
```

---

#### **Action 3: Learn from Keanu (your only active user)**

**Why:** He's the ONLY person who's used the product. His feedback is gold.

**Email/Text Template:**
```
Subject: You're the only person who used PropIQ - need your help

Hey Keanu,

You're literally the only person (outside of me) who's actually used PropIQ to analyze a property. That makes your feedback incredibly valuable.

Can I buy you lunch/coffee and pick your brain for 20 minutes?

Specifically want to know:
- What made you try it in the first place?
- Was the analysis useful? What did you do with it?
- Why didn't you run a second analysis?
- What would make you pay $29/mo for this?

Let me know when you're free this week.

Thanks,
Brian
```

---

### Phase 2: Activate Your Network (This Week)

Since Rob, Tom, and Adam haven't even signed up, you need to directly invite them.

#### **Action 4: Personal invites to Rob, Tom, Adam**

**Text Message Template:**
```
Hey [Name],

Quick favor - I'm working on PropIQ (AI-powered real estate analysis tool) and realized you haven't tried it yet.

Would you sign up and give me brutally honest feedback? Takes 2 minutes to analyze a property.

Link: propiq.com/signup?ref=friends

I'll buy you [coffee/beer/lunch] for 15 minutes of your time to hear what you think.

Down?

- Brian
```

**Follow-up Email (if they sign up):**
```
Subject: Thanks for signing up - here's how to test it

Hey [Name],

Thanks for signing up! Here's the fastest way to test PropIQ:

1. Click "Analyze Property"
2. Enter any address (or use this sample: 742 Evergreen Terrace, Springfield)
3. Add rough numbers (purchase price, rent estimate)
4. Hit "Analyze"

Takes 60 seconds. Then let me know:
- Did the analysis make sense?
- Would you actually use this?
- What's missing?

Let's grab [coffee/lunch] this week to discuss. My treat.

- Brian
```

---

### Phase 3: Clean Up Your Data (Before You Scale)

Your metrics are polluted with test data. Clean it up now before you get more users.

#### **Action 5: Archive test accounts**

**Preview what will be deleted:**
```bash
cd /Users/briandusape/Projects/propiq
npx convex run cleanupTestAccounts:previewTestAccounts
```

**If it looks right, delete:**
```bash
npx convex run cleanupTestAccounts:deleteTestAccounts
```

This will:
- Delete 119 test user accounts
- Remove test analyses
- Clean up sessions
- Give you accurate metrics

**After cleanup, your database will show:**
- 2-3 real users (Adonis, James, maybe Keanu if you count friends)
- 0 test pollution
- Accurate activation and conversion metrics

---

## 🧪 What You'll Learn from These Conversations

### Questions to Ask:

**For Adonis & James (didn't activate):**
1. What were you hoping to get from PropIQ?
2. What stopped you from trying the first analysis?
3. Was the signup process confusing?
4. Did you forget you signed up?
5. What would make you come back and try it?

**For Keanu (only active user):**
1. Why did you decide to try it?
2. Was the analysis useful? What did you learn?
3. Did you make any decisions based on it?
4. Why didn't you run a 2nd analysis?
5. What would make it worth $29/month?

**For Rob/Tom/Adam (once they try it):**
1. First impressions - intuitive or confusing?
2. Is the analysis accurate/useful?
3. Would you actually use this while property hunting?
4. What features are missing?
5. How much would you pay for this?

---

## 📈 What Success Looks Like (Next 30 Days)

### Realistic Goals:
1. **Interview all 5 people** (Adonis, James, Keanu, Rob, Tom, Adam)
2. **Get 2-3 people to run their first analysis** (activation)
3. **Identify the #1 blocker** preventing people from trying it
4. **Fix the activation flow** based on feedback
5. **Get 1-2 referrals** from people who find it useful

### Don't Focus On:
- ❌ Conversion (you need users first)
- ❌ Pricing optimization (too early)
- ❌ Scaling marketing (distribution doesn't matter if activation is broken)

---

## 🔥 The Hard Truth

You have a **distribution problem**, not a conversion problem.

### Current Funnel:
```
Unknown traffic → 2 signups → 0 activated (0%) → 0 paying (0%)
```

### What This Means:
1. **You're not getting traffic** - Only 2 real signups in 2+ months
2. **Activation is broken** - 0% of signups use the product
3. **You can't test conversion** - No one has seen enough value to upgrade

### What to Focus On:
1. **Get 10 real users to sign up** (friends, network, communities)
2. **Get 5 of them to run 1 analysis** (50% activation rate)
3. **Get 2 of them to run 3+ analyses** (product-market fit signal)
4. **Interview everyone** - understand what works and what doesn't

---

## 📋 Week-by-Week Plan

### Week 1 (This Week)
- [ ] Email Adonis (Monday)
- [ ] Email James (Monday)
- [ ] Text/call Keanu (Tuesday)
- [ ] Invite Rob, Tom, Adam (Wednesday)
- [ ] Preview test account cleanup (Thursday)
- [ ] Delete test accounts (Friday)
- [ ] Schedule interviews with anyone who responds

### Week 2
- [ ] Complete 3+ user interviews
- [ ] Document feedback themes
- [ ] Identify #1 activation blocker
- [ ] Fix the blocker (UI, onboarding, copy, etc.)
- [ ] Ask interviewees for 1-2 referrals each

### Week 3
- [ ] Reach out to referrals
- [ ] Get 5 more real signups (goal: 10 total users)
- [ ] Test improved activation flow
- [ ] Track activation rate (goal: 50%+)

### Week 4
- [ ] Identify users who ran 3+ analyses
- [ ] Interview power users to understand use case
- [ ] Draft pricing/packaging based on learnings
- [ ] Decide: pivot, iterate, or scale

---

## 🎬 Email Templates - Ready to Send

### Template 1: Adonis Jackson

```
To: soldbyadonis@gmail.com
Subject: Adonis - quick question about PropIQ

Hi Adonis,

I saw you signed up for PropIQ in December but haven't run your first analysis yet.

As a fellow real estate person, I'm curious - what were you hoping PropIQ would help you with? And what got in the way of trying it?

I'm the founder and would love 10 minutes on the phone to understand what would make this useful for your business at Sold By Adonis.

My calendar: [INSERT CALENDLY]
Or just reply with a time that works.

Thanks,
Brian Dusape
Founder, PropIQ
[Your phone number]
```

---

### Template 2: James Marston

```
To: anudesarmes@gmail.com
Subject: James - saw you logged in twice to PropIQ

Hi James,

I noticed you logged into PropIQ twice in December but didn't run an analysis.

I'm the founder, and I'd love to know:
1. What were you looking for when you signed up?
2. What stopped you from analyzing a property?

Can I call you for 10 minutes to understand how to make this better?

Reply with a time or grab a slot here: [INSERT CALENDLY]

Best,
Brian Dusape
Founder, PropIQ
[Your phone number]
```

---

### Template 3: Keanu Lamarre

```
To: keanulamarre@gmail.com
Subject: You're the only person who used PropIQ - need your help

Hey Keanu,

You're literally the only person (outside of me) who's actually used PropIQ to analyze a property. That makes your feedback incredibly valuable.

Can I buy you lunch/coffee and pick your brain for 20 minutes?

Specifically want to know:
- What made you try it in the first place?
- Was the analysis useful? What did you do with it?
- Why didn't you run a second analysis?
- What would make you pay $29/mo for this?

Let me know when you're free this week.

Thanks,
Brian
```

---

### Template 4: Rob/Tom/Adam

```
Hey [Name],

Quick favor - I'm working on PropIQ (AI-powered real estate analysis tool) and realized you haven't tried it yet.

Would you sign up and give me brutally honest feedback? Takes 2 minutes to analyze a property.

Link: propiq.com/signup?ref=friends

I'll buy you [coffee/beer/lunch] for 15 minutes of your time to hear what you think.

Down?

- Brian
```

---

## 🚀 Next Steps (Do This Today)

1. **Deploy the cleanup script:**
   ```bash
   cd /Users/briandusape/Projects/propiq
   npx convex deploy --yes
   ```

2. **Preview test accounts to be deleted:**
   ```bash
   npx convex run cleanupTestAccounts:previewTestAccounts
   ```

3. **If it looks right, delete them:**
   ```bash
   npx convex run cleanupTestAccounts:deleteTestAccounts
   ```

4. **Send the 3 emails** (Adonis, James, Keanu)

5. **Text/call Rob, Tom, Adam**

6. **Set up Calendly** for easy scheduling

7. **Prepare interview questions** (see "What You'll Learn" section)

---

**Files Generated:**
- `/Users/briandusape/Projects/propiq/convex/cleanupTestAccounts.ts` - Database cleanup script
- `/Users/briandusape/Projects/propiq/exports/REAL_USER_OUTREACH_PLAN.md` - This document

**Last Updated:** 2026-01-01
**Next Review:** After completing Week 1 interviews
