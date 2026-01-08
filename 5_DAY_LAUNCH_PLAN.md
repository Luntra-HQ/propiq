# 🚀 PropIQ 5-Day Product Hunt Launch Plan

**Launch Date:** Monday, January 13, 2026
**Today:** Thursday, January 8, 2026
**Days Remaining:** 5 days
**Created:** 2026-01-08 by Claude Code

---

## CURRENT STATE ASSESSMENT ✅

### What's Working (Verified Jan 8)
- ✅ **Production site LIVE** - https://propiq.luntra.one (HTTP 200)
- ✅ **Frontend builds** - 1m 53s, no errors
- ✅ **Convex backend healthy** - mild-tern-361.convex.cloud
- ✅ **Core features exist** - Signup, login, analysis, payments, calculator
- ✅ **Recent bug fixes** - 26 commits in last 7 days (signup, payments, auth)
- ✅ **7 signups** since Dec 17 (proving it works)

### What's Broken/Missing
- ❌ **Test suite broken** - Tests expect old FastAPI backend, not Convex
- ❌ **Uncommitted work** - 11 modified files, 30+ new docs not committed
- ❌ **No PH materials** - 0 screenshots, 0 demo video, no launch copy
- ❌ **No upvote network** - No committed supporters list
- ❌ **Manual testing incomplete** - UAT docs exist but 0/92 tests executed

### Critical Issues to Fix
1. **Commit your work** - You have great docs but they're uncommitted
2. **Manual test P0 flows** - We need to verify signup/payment/analysis work
3. **Create launch materials** - PH requires screenshots + demo
4. **Build upvote list** - Need 100+ committed supporters

---

## 5-DAY SPRINT PLAN

### DAY 1: THURSDAY JAN 8 (Today) - STABILIZE
**Goal:** Commit all work, fix any critical bugs

**Morning (2 hours)**
- [ ] Commit all uncommitted work (11 files + 30 docs)
  ```bash
  git add .
  git commit -m "feat: product stabilization before PH launch"
  git push
  ```
- [ ] Read through your own UAT docs (you created great guides!)
- [ ] Manual test UAT-001 (signup) - 10 min
- [ ] Manual test UAT-003 (payment) - 15 min
- [ ] Manual test UAT-016 (analysis) - 10 min

**Afternoon (3 hours)**
- [ ] If any of above 3 tests FAIL → Fix immediately
- [ ] Test on real iPhone (your own phone)
- [ ] Test password reset flow
- [ ] Verify email delivery works (Resend)

**Evening (1 hour)**
- [ ] Document test results
- [ ] List any bugs found
- [ ] Create bug fix plan for tomorrow

**Deliverables:**
- ✅ All code committed
- ✅ 3 critical flows tested
- ✅ Bug list created (if any)

---

### DAY 2: FRIDAY JAN 9 - FIX & CREATE
**Goal:** Fix any bugs, create PH materials

**Morning (3 hours) - Bug Fixes**
- [ ] Fix any P0 bugs from yesterday's testing
- [ ] Re-test fixed flows
- [ ] Verify mobile works on real device

**Afternoon (4 hours) - Create PH Materials**
- [ ] Take 5 high-quality screenshots:
  1. Landing page hero
  2. Pricing page (4 tiers visible)
  3. Property analysis results (with deal score)
  4. Deal calculator interface
  5. Dashboard showing usage limits

- [ ] Record demo video (60-90 seconds):
  - Script: "PropIQ analyzes rental properties in 30 seconds using AI"
  - Show: Enter address → Get analysis → See deal score
  - Tool: Loom (free) or QuickTime screen recording

- [ ] Write PH copy:
  - Tagline (10 words max)
  - Description (3 sentences)
  - Maker comment (your story, why you built this)

**Deliverables:**
- ✅ All bugs fixed
- ✅ 5 screenshots ready
- ✅ Demo video recorded
- ✅ PH copy written

---

### DAY 3: SATURDAY JAN 10 - NETWORK BUILD
**Goal:** Build upvote supporter list

**Morning (2 hours) - Outreach Prep**
- [ ] Create Google Form: "Support PropIQ's Product Hunt Launch"
  - Name, Email, "Will you upvote on Jan 13 at 12:01 AM PST?"

- [ ] Draft email to Drexel network:
  ```
  Subject: I'm launching PropIQ on Product Hunt Monday - can you support?

  Hey [name],

  I'm launching PropIQ (AI property analysis for investors) on Product Hunt this Monday, Jan 13.

  Could you upvote when it goes live? Takes 30 seconds.

  Sign up here: [Google Form link]

  I'll send the link Monday morning!

  Thanks,
  Brian
  ```

**Afternoon (4 hours) - Send Emails**
- [ ] Email Drexel alumni network
- [ ] Email friends/family
- [ ] Post in any investor communities you're in
- [ ] LinkedIn post announcing launch
- [ ] Goal: 100+ committed supporters

**Evening (1 hour)**
- [ ] Tally commitments
- [ ] Send thank you emails
- [ ] Create upvote reminder template for Monday

**Deliverables:**
- ✅ 100+ committed upvoters
- ✅ Google Form with signups
- ✅ Reminder email ready

---

### DAY 4: SUNDAY JAN 11 - PREP & POLISH
**Goal:** Finalize everything for Monday launch

**Morning (3 hours) - PH Submission Prep**
- [ ] Create Product Hunt account (if not already)
- [ ] Upload all 5 screenshots
- [ ] Upload demo video
- [ ] Write tagline, description, maker comment
- [ ] Add links (website, pricing, docs)
- [ ] Set to "Draft" (don't publish yet)

**Afternoon (3 hours) - Social Media Prep**
- [ ] Draft LinkedIn post for Monday
- [ ] Draft Twitter/X post
- [ ] Draft Instagram story
- [ ] Schedule Drexel alumni reminder email (send 11 PM Sunday)

**Evening (2 hours) - Final Testing**
- [ ] Full user flow test one more time:
  - Signup → Login → Analyze property → Upgrade → Payment
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS + Android if possible)
- [ ] Fix any last-minute issues

**Deliverables:**
- ✅ PH listing ready (draft mode)
- ✅ Social posts written
- ✅ Product tested one final time
- ✅ All systems go

---

### DAY 5: MONDAY JAN 13 - LAUNCH DAY 🚀
**Goal:** Execute perfect launch

**Pre-Launch (11 PM Sun - 12:01 AM PST Mon)**
- [ ] Set alarm for 11:45 PM Sunday
- [ ] Coffee ready
- [ ] PH draft listing open
- [ ] Upvote reminder email ready to send

**12:01 AM PST - GO LIVE**
- [ ] Submit Product Hunt listing
- [ ] Verify it's live
- [ ] Send upvote reminder email to 100+ supporters
- [ ] Post link to all social media
- [ ] Go to sleep (set alarm for 6 AM)

**Morning (6 AM - 12 PM PST)**
- [ ] Check PH ranking
- [ ] Respond to EVERY comment on PH
- [ ] Thank every upvoter personally
- [ ] Share progress updates ("We're #15!")
- [ ] Post to Reddit communities (r/SideProject, r/Entrepreneur)

**Afternoon (12 PM - 6 PM PST)**
- [ ] Continue engaging with comments
- [ ] Answer questions in depth
- [ ] Share to more communities
- [ ] Push final reminder to network
- [ ] Monitor signups/conversions

**Evening (6 PM - 11:59 PM PST)**
- [ ] Final engagement push
- [ ] Thank supporters publicly
- [ ] Celebrate (regardless of ranking!)
- [ ] Plan follow-up content

**Deliverables:**
- ✅ Product launched on PH
- ✅ 100+ upvotes (hopefully!)
- ✅ Engaged with all comments
- ✅ New signups from PH traffic

---

## CRITICAL SUCCESS FACTORS

### Must Have Before Launch:
1. ✅ Signup works (verify manually)
2. ✅ Payment works (test with real Stripe)
3. ✅ Analysis works (test AI response)
4. ✅ 5 screenshots
5. ✅ Demo video
6. ✅ 100+ upvote commitments

### Nice to Have:
- Testimonials (you have 0 customers, so skip this)
- Hunter (not required, self-launch is fine)
- Press coverage (unrealistic in 5 days)

### Can Skip:
- Automated tests (you don't need them to launch)
- Perfect test coverage
- All 92 UAT tests

---

## EMERGENCY PROCEDURES

### If Critical Bug Found (Days 1-2):
1. **STOP** - Don't create PH materials until fixed
2. **FIX** - All hands on deck to fix
3. **TEST** - Verify fix works
4. **CONTINUE** - Back to plan

### If Bug Found Day 3-4:
1. **ASSESS** - Is it launch blocking?
   - Yes (signup/payment broken): Fix immediately, delay if needed
   - No (minor UX issue): Document, fix after launch
2. **DECIDE** - Can we ship with this?
3. **ACT** - Fix or proceed

### If <50 Upvote Commitments by Sunday:
- **DON'T PANIC** - 50 is still decent
- Launch anyway
- Focus on comment engagement vs. ranking

---

## REALISTIC EXPECTATIONS

### Best Case (200+ upvotes):
- Product of the Day candidate
- 500-1,000 visitors
- 20-50 signups
- 2-5 paying customers
- Great credibility boost

### Most Likely (50-100 upvotes):
- Top 10-20 for the day
- 200-400 visitors
- 10-20 signups
- 1-2 paying customers
- Solid launch

### Worst Case (10-30 upvotes):
- Doesn't rank highly
- 50-100 visitors
- 3-5 signups
- 0 paying customers
- Still learned a lot

**All outcomes are valuable learning experiences!**

---

## YOUR ROLE VS CLAUDE'S ROLE

### You (Brian):
- Manual testing (only you can verify UX)
- Networking (your contacts, your story)
- Decision making (launch vs delay)
- Engagement on launch day (your personality)

### Claude Code (Me):
- Fix bugs you find
- Create technical docs
- Automate where possible
- Review code quality
- Strategic advice

**We're a team. Use me when you need technical help.**

---

## QUICK DECISION TREE

**Friday Night:** Should I delay launch?
- All 3 P0 tests PASS? → Proceed with launch
- 1-2 P0 tests FAIL? → Fix over weekend, launch Monday
- All 3 P0 tests FAIL? → Delay to Jan 20, fix seriously broken product

**Sunday Night:** Final go/no-go?
- Product works? ✅
- Have 50+ upvotes committed? ✅
- Have screenshots/video? ✅
- → GO FOR LAUNCH

**Monday Morning:** Low upvotes, what do?
- Keep engaging with comments
- Share to more communities
- Don't obsess over ranking
- Focus on feedback quality

---

## FILES YOU SHOULD READ

Before you start, read these (you created them!):
1. `START_HERE.md` - Your UAT guide
2. `CONTINUE_FROM_HERE.md` - Your test results
3. `UAT_QUICK_REFERENCE.md` - Testing cheat sheet

**These are gold. Use them.**

---

## TRACKING PROGRESS

Update this checklist daily:

**Day 1 (Thu Jan 8):**
- [ ] All work committed
- [ ] 3 P0 tests complete
- [ ] Bug list created

**Day 2 (Fri Jan 9):**
- [ ] All bugs fixed
- [ ] 5 screenshots ready
- [ ] Demo video done

**Day 3 (Sat Jan 10):**
- [ ] 100+ upvotes committed
- [ ] Outreach complete

**Day 4 (Sun Jan 11):**
- [ ] PH draft ready
- [ ] Social posts written
- [ ] Final test pass

**Day 5 (Mon Jan 13):**
- [ ] LAUNCHED! 🚀

---

## FINAL ADVICE

### From Your Strategic Advisor Audit:
Yes, I said you weren't ready. **You weren't on Jan 8.**

But you can GET ready in 5 days if you:
1. Focus on what matters (P0 tests, materials, network)
2. Skip what doesn't (automated tests, perfection)
3. Execute this plan daily
4. Make quick decisions

### From Me (Claude):
- You've built something real (7 signups prove it)
- You've fixed tons of bugs (26 commits)
- You've created great docs (UAT guides are solid)
- You can do this in 5 days

**Let's ship this thing.**

---

## GETTING STARTED (RIGHT NOW)

**Your next 3 actions (takes 30 min):**

1. **Commit your work:**
   ```bash
   cd /Users/briandusape/Projects/propiq
   git add .
   git commit -m "feat: pre-launch stabilization and documentation"
   git push
   ```

2. **Test signup (10 min):**
   - Go to https://propiq.luntra.one
   - Click "Sign Up"
   - Create account with your real email
   - Verify email arrives
   - Log in and see dashboard

3. **Report back:**
   - Tell me: "Signup works!" or "Signup failed: [error]"
   - I'll help fix if broken

**After that, follow Day 1 plan above.**

---

**You got this. Let's launch PropIQ on Monday. 🚀**

**Last Updated:** 2026-01-08
**Next Update:** Daily as you progress
**Owner:** Brian Dusape
**Support:** Claude Code
