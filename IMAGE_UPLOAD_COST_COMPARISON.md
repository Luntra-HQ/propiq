# PropIQ Image Upload: Cost Comparison

**Date:** 2026-01-06
**Decision:** AWS S3 vs Convex Pro vs GCP Cloud Storage

---

## TL;DR - The Winner

🏆 **AWS S3 with Activate Credits** (or GCP with $1000 credit)

**Savings:** $25-100/month vs Convex Pro approach
**Implementation Time:** 2-3 hours
**Ongoing Cost:** $0 (using credits), then $2-5/month

---

## Detailed Comparison

| Feature | Convex Pro | AWS S3 + Convex Free | GCP Storage + Convex Free |
|---------|------------|----------------------|---------------------------|
| **Monthly Base Cost** | $25 | $0 | $0 |
| **Using Your Credits** | ❌ No | ✅ AWS Activate | ✅ $1000 GCP |
| **Effective Cost (Year 1)** | $300-1200 | **$0** | **$0** |
| **File Storage Included** | 100 GB | Pay-per-use | Pay-per-use |
| **Bandwidth Included** | 50 GB | Pay-per-use | Pay-per-use |
| **Bandwidth Overage Cost** | $0.30/GB | $0.09/GB | $0.08/GB |
| **After Credits Expire** | $25-100/mo | **$2-5/mo** | **$2-5/mo** |
| **Scalability** | Good | Excellent | Excellent |
| **Implementation Complexity** | Low | Medium | Medium |
| **Setup Time** | 0 mins | 30 mins | 30 mins |
| **Code Changes Required** | Minimal | Moderate | Moderate |

---

## Cost Breakdown Scenarios

### Scenario 1: Small Scale (50 users, early growth)
**Usage:**
- 50 users upload 3 images each = 150 images
- Average image size: 2 MB (after compression)
- Views per image: 10/month

**Convex Pro:**
```
Base cost: $25/month
Storage: 0.3 GB (included)
Bandwidth: 3 GB uploads + 30 GB downloads = 33 GB (included)
Total: $25/month
Annual: $300
```

**AWS S3 + Convex Free:**
```
Storage: 0.3 GB × $0.023/GB = $0.007/month
Uploads: 0.3 GB (free tier)
Downloads: 3 GB × $0.09/GB = $0.27/month
Total: $0.28/month (covered by AWS Activate credits)
Annual: $3.36 → $0 with credits
```

**💰 Savings: $300/year**

---

### Scenario 2: Medium Scale (500 users, product-market fit)
**Usage:**
- 500 users upload 3 images each = 1,500 images
- Average image size: 2 MB
- Views per image: 20/month

**Convex Pro:**
```
Base cost: $25/month
Storage: 3 GB (included)
Bandwidth:
  - Uploads: 3 GB
  - Downloads: 60 GB
  - Total: 63 GB (13 GB overage)
Overage: 13 GB × $0.30/GB = $3.90/month
Total: $28.90/month
Annual: $347
```

**AWS S3 + Convex Free:**
```
Storage: 3 GB × $0.023/GB = $0.07/month
Uploads: 3 GB (free tier)
Downloads: 60 GB × $0.09/GB = $5.40/month
Total: $5.47/month (likely covered by AWS Activate)
Annual: $66 → ~$0-20 with credits
```

**💰 Savings: $327-347/year**

---

### Scenario 3: Large Scale (2,000 users, scaling)
**Usage:**
- 2,000 users upload 3 images each = 6,000 images
- Average image size: 2 MB
- Views per image: 30/month

**Convex Pro:**
```
Base cost: $25/month
Storage: 12 GB (included)
Bandwidth:
  - Uploads: 12 GB
  - Downloads: 360 GB
  - Total: 372 GB (322 GB overage)
Overage: 322 GB × $0.30/GB = $96.60/month
Total: $121.60/month
Annual: $1,459
```

**AWS S3 + Convex Free:**
```
Storage: 12 GB × $0.023/GB = $0.28/month
Uploads: 12 GB × $0.09/GB = $1.08/month
Downloads: 360 GB × $0.09/GB = $32.40/month
Total: $33.76/month
Annual: $405
```

**💰 Savings: $1,054/year**

---

## Break-Even Analysis

**Question:** At what scale does AWS S3 become more expensive than Convex Pro?

**Answer:** Never at realistic image usage levels.

**Calculation:**
```
Convex Pro base: $25/month
AWS S3 break-even: $25/month

To reach $25/month on AWS S3:
- Storage: $0.28/month (12 GB)
- Remaining for bandwidth: $24.72
- Bandwidth budget: $24.72 / $0.09/GB = 274 GB/month

274 GB bandwidth = ~137,000 image views/month (at 2 MB per image)

At 3 images per user:
137,000 views / 3 images = 45,667 user views/month
If each user views 10 times: 4,567 active users
```

**Conclusion:** AWS S3 is cheaper until you have **4,500+ active users viewing images regularly**. At that scale, your revenue will easily cover the cost.

---

## ROI Analysis: Is Image Upload Worth It?

### Cost of Implementation
- Developer time: 2-3 hours × $50/hour = $100-150 (one-time)
- AWS setup: Free (using credits)
- Ongoing cost: $0-5/month

**Total Year 1 Cost:** $100-150 (setup) + $0-60 (hosting) = **$100-210**

### Revenue Impact

**Hypothesis:** Property images increase conversion rate by 10-20%

**Current state (no images):**
- 100 trial users/month
- 10% convert to Starter plan ($29/mo)
- Revenue: 10 × $29 = $290/month = $3,480/year

**With images (10% conversion increase):**
- 100 trial users/month
- 11% convert to Starter plan
- Revenue: 11 × $29 = $319/month = $3,828/year
- **Additional revenue: $348/year**

**ROI:**
```
Cost: $100-210
Revenue increase: $348
Net benefit: $138-248
ROI: 66-148%
```

**Even a conservative 5% conversion improvement pays for itself.**

---

## Credit Utilization Strategy

### Your Available Credits

1. **AWS Activate:** Unknown amount (typically $1,000-5,000 for startups)
2. **GCP Credit:** $1,000 confirmed

### Recommended Credit Usage Plan

**Year 1: AWS Activate**
- Use AWS S3 for image storage ($0-60/year from credits)
- Save GCP credit for future use
- Monitor AWS credit balance quarterly

**Year 2+: Reassess**
- If AWS credits expired and usage < $100/year → **stay with AWS S3**
- If AWS costs exceed $100/year → **switch to GCP** (use $1000 credit)
- If GCP credit exhausted → **evaluate Convex Pro** (only if very high traffic)

### Expected Credit Lifespan

**AWS Activate ($1,000 credit):**
```
$5/month AWS S3 usage → 200 months (16+ years)
```

**GCP ($1,000 credit):**
```
$5/month GCP Storage → 200 months (16+ years)
```

**Combined credits = 32+ years of free image hosting** 🎉

You'll likely scale to paid Convex Pro long before your credits run out, and at that point, you'll have the revenue to support it.

---

## Decision Matrix

| Criteria | Weight | Convex Pro | AWS S3 | GCP Storage |
|----------|--------|------------|---------|-------------|
| **Cost (Year 1)** | 30% | 0/10 | 10/10 | 10/10 |
| **Ease of Setup** | 20% | 10/10 | 7/10 | 7/10 |
| **Scalability** | 20% | 7/10 | 10/10 | 10/10 |
| **Maintenance** | 15% | 9/10 | 8/10 | 8/10 |
| **Long-term Cost** | 15% | 3/10 | 9/10 | 9/10 |

**Weighted Scores:**
- Convex Pro: 5.55/10
- AWS S3: **8.9/10** ✅
- GCP Storage: **8.9/10** ✅

---

## Final Recommendation

### 🏆 Use AWS S3 + Convex Free Tier

**Rationale:**
1. **$0 cost using your AWS Activate credits**
2. **$300-1,400/year savings** vs Convex Pro
3. **Better architecture** (scalable, industry standard)
4. **Keep GCP credit as backup** for future needs

### Implementation Timeline

**Week 1:**
- Day 1: Set up AWS S3 bucket (30 mins)
- Day 2-3: Implement backend (Convex actions) (2 hours)
- Day 4-5: Implement frontend (upload component) (2 hours)
- Day 6-7: Testing and refinement (2 hours)

**Week 2:**
- Deploy to production
- Monitor usage for 1 week
- Adjust limits if needed

**Total effort:** ~6-8 hours spread over 2 weeks

---

## What If Your AWS Credits Run Out Early?

**No problem!** You have multiple fallback options:

1. **Switch to GCP Cloud Storage** (use your $1000 credit)
   - Code changes: Swap AWS SDK for GCP SDK (~2 hours)
   - Cost: $0 (using GCP credit)

2. **Stay with AWS S3 and pay** (~$2-5/month)
   - No code changes needed
   - Still cheaper than Convex Pro

3. **Upgrade to Convex Pro** (if you're scaling fast)
   - Simplifies architecture
   - Makes sense at ~$10k+/month revenue

---

## Summary: Why AWS S3 Wins

✅ **$0 cost** (using your credits)
✅ **$300-1,400/year savings** vs Convex Pro
✅ **Better scalability** (proven at massive scale)
✅ **Industry standard** (what production apps use)
✅ **Faster uploads** (direct browser-to-S3)
✅ **Future-proof** (can handle millions of images)
✅ **Keep Convex on free tier** (no upgrade needed)

**Next step:** Follow the implementation guide in `IMAGE_UPLOAD_AWS_IMPLEMENTATION.md`

---

**Questions? Need help with setup? Just ask!**
