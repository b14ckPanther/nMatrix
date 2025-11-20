# Firebase Pricing for nmMatrix 💰

## Quick Answer

**Yes, nmMatrix uses Firebase services that can cost money, BUT:**
- ✅ Firebase has a **Generous Free Tier** (Spark Plan) for most services
- ⚠️ Cloud Functions **require Blaze Plan** (pay-as-you-go, but still has free tier)
- 💡 You can stay within free limits with careful usage

## Firebase Pricing Structure

### 🔥 Firebase Free Tier (Spark Plan) Limitations:

nmMatrix **requires Blaze Plan** because:
- ✅ Cloud Functions only work on Blaze Plan (not available on free Spark Plan)
- ✅ But Blaze Plan still has a generous **free tier**!

### Blaze Plan Free Tier Limits (Per Month):

#### **Firestore Database:**
- ✅ **Free:** 50,000 reads, 20,000 writes, 20,000 deletes per day
- 💰 **Paid:** $0.06 per 100,000 document reads, $0.18 per 100,000 writes
- 📊 **For nmMatrix:** Evolution cycles create ~5-10 documents per cycle. Running daily would use ~300 writes/month = **FREE** ✅

#### **Cloud Functions:**
- ✅ **Free:** 2 million invocations/month, 400,000 GB-seconds, 200,000 CPU-seconds
- 💰 **Paid:** $0.40 per million invocations after free tier
- 📊 **For nmMatrix:** 
  - Scheduled evolution: 1 invocation/day = 30/month
  - HTTP triggers: Only when you use admin dashboard
  - Firestore triggers: Only on approval updates
  - **Estimated: ~50-100 invocations/month = FREE** ✅

#### **Firebase Hosting:**
- ✅ **Free:** 10 GB storage, 360 MB/day transfer
- 💰 **Paid:** $0.026/GB storage, $0.15/GB transfer after free tier
- 📊 **For nmMatrix:** Static site, minimal transfer = **FREE** ✅

#### **Firebase Authentication:**
- ✅ **Free:** Unlimited users
- 💰 **Paid:** Free forever
- 📊 **For nmMatrix:** FREE ✅

#### **Firebase Storage:**
- ✅ **Free:** 5 GB storage, 1 GB/day downloads
- 💰 **Paid:** $0.026/GB storage, $0.12/GB downloads
- 📊 **For nmMatrix:** Code snapshots are minimal = **FREE** ✅

#### **Cloud Scheduler (for scheduled evolution):**
- ✅ **Free:** 3 jobs per month
- 💰 **Paid:** $0.10 per job/month after free tier
- 📊 **For nmMatrix:** 1 scheduled job (daily evolution) = **FREE** ✅

## Real Cost Estimate for nmMatrix

### If You Stay Within Free Limits:
**💰 $0.00/month** ✅

This is realistic if:
- Evolution runs once per day (30 times/month)
- You don't have heavy traffic (thousands of users)
- You don't create thousands of versions
- Most activity is manual triggers from admin dashboard

### If You Exceed Free Limits (Low Usage):
**💰 $1-5/month** (estimated)

This might happen if:
- Heavy admin dashboard usage (lots of Firestore reads)
- Multiple evolution cycles per day
- High traffic to the site
- Many versions/approvals created

### High Usage Scenario:
**💰 $10-50/month**

If:
- Very high traffic
- Many users
- Frequent evolution cycles
- Large amounts of data stored

## Cost Breakdown by Activity

### Typical nmMatrix Usage (Daily Evolution):
| Service | Usage | Free Tier | Cost |
|---------|-------|-----------|------|
| Firestore Writes | ~10/day | 20,000/day | ✅ FREE |
| Firestore Reads | ~50/day | 50,000/day | ✅ FREE |
| Cloud Functions | ~1/day | 2M/month | ✅ FREE |
| Cloud Scheduler | 1 job | 3/month | ✅ FREE |
| Hosting | Minimal | 360MB/day | ✅ FREE |
| **TOTAL** | | | **$0.00** ✅ |

### Admin Dashboard Usage (10 visits/day):
| Service | Usage | Free Tier | Cost |
|---------|-------|-----------|------|
| Firestore Reads | ~100/day | 50,000/day | ✅ FREE |
| Cloud Functions | ~10/day | 2M/month | ✅ FREE |
| **TOTAL** | | | **$0.00** ✅ |

## How to Monitor Costs

### 1. Firebase Console Budget Alerts:
1. Go to [Firebase Console](https://console.firebase.google.com/project/nmmatrix-824a3/usage)
2. Set up budget alerts:
   - Alert at $1/month
   - Alert at $5/month
   - Alert at $10/month

### 2. Check Current Usage:
1. Go to Firebase Console → Usage and Billing
2. See real-time usage vs. free tier limits
3. Monitor daily/weekly trends

### 3. Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/billing)
2. Enable billing alerts
3. Set budget limits

## Ways to Minimize Costs

### ✅ Stay Free:
1. **Limit Evolution Cycles:**
   - Keep default 24-hour schedule
   - Don't trigger manually too often
   - Disable evolution when not needed

2. **Optimize Admin Dashboard:**
   - Don't leave it open all day
   - Use pagination for versions list
   - Cache data when possible

3. **Monitor Firestore Reads:**
   - Limit queries with `.limit()`
   - Use indexes efficiently
   - Cache frequently accessed data

4. **Clean Up Old Data:**
   - Archive old versions periodically
   - Delete unused documents
   - Clean up old snapshots

### ⚠️ Disable Evolution Temporarily:
If you want to pause costs, you can:
1. Go to Firestore → `configs/evolution`
2. Set `enabled` to `false`
3. Evolution cycles will skip automatically

## Cost Warning Signs

🚨 **Watch out for:**
- High Firestore reads (>10,000/day)
- Frequent function invocations (>100/day)
- Large storage usage (>1GB)
- High network transfer (>100MB/day)

## Budget Recommendations

### For Personal/Small Projects:
- **Budget:** $5-10/month
- **Likely Cost:** $0-2/month
- **Safety Buffer:** Stay within free tier

### For Production/Heavy Usage:
- **Budget:** $20-50/month
- **Likely Cost:** $5-20/month
- **Monitor:** Set up alerts at $10, $25, $50

## Important Notes

1. **Blaze Plan ≠ Always Paying:**
   - Blaze Plan is pay-as-you-go
   - You only pay for what you use
   - Free tier still applies

2. **Billing Account Required:**
   - You need to add a billing account for Blaze Plan
   - But you won't be charged if you stay within free limits
   - Google won't charge you without explicit approval

3. **Evolution Cycle Costs:**
   - Each cycle: ~5-10 Firestore writes
   - ~1-5 Firestore reads
   - ~1 Cloud Function invocation
   - Very minimal!

4. **Most Expensive Component:**
   - Cloud Functions (if you exceed 2M invocations/month)
   - Firestore writes (if you exceed 20,000/day)
   - But both are unlikely for nmMatrix

## Summary

**Short Answer:** 
- ✅ **Most likely: $0/month** (stays within free tier)
- ⚠️ **Possible: $1-5/month** (light usage beyond free tier)
- 💰 **Unlikely: $10-50/month** (heavy usage)

**Recommendation:**
- Start with monitoring usage
- Set up budget alerts at $1, $5, $10
- Most projects stay **completely FREE** ✅

The cost is **very minimal** for a personal project like nmMatrix. You're more likely to stay in the free tier than pay anything!

