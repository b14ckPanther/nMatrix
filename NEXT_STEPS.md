# Next Steps - After Enabling Firebase Services

You've successfully enabled:
- ✅ Firestore Database
- ✅ Authentication (Anonymous sign-in)
- ✅ Cloud Functions (Blaze plan)

Now let's complete the setup!

## Step 1: Install Firebase CLI

Since we need to deploy, you'll need Firebase CLI. I've installed it locally in your project.

**To use it, run commands with `npx`:**
```bash
npx firebase login
npx firebase use --add
```

## Step 2: Login to Firebase

```bash
cd /Users/zangeel/Desktop/nmMatrix
npx firebase login
```

This will open a browser window to authenticate with your Google account.

## Step 3: Select Your Firebase Project

```bash
npx firebase use --add
```

Select your project: `nmmatrix-824a3`

## Step 4: Deploy Firestore Rules & Indexes

```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

This deploys the security rules and database indexes needed for the app.

## Step 5: Initialize Firestore Configuration

We need to create the initial configuration document in Firestore.

**Option A: Using Firebase Console (Easiest)**

1. Go to [Firestore Database](https://console.firebase.google.com/project/nmmatrix-824a3/firestore)
2. Click "Start collection"
3. Collection ID: `configs`
4. Document ID: `evolution`
5. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| `enabled` | boolean | `true` |
| `intervalHours` | number | `24` |
| `maxMutationsPerCycle` | number | `5` |
| `minCostFunctionScore` | number | `0.6` |

Click "Save"

**Option B: Using Firebase CLI**

After deploying functions (see Step 6), you can use a Cloud Function or manually create it.

## Step 6: Deploy Cloud Functions

First, let's build the functions:

```bash
cd functions
npm run build
cd ..
```

Then deploy:

```bash
npx firebase deploy --only functions
```

This will deploy all the Evolution Loop functions:
- `scheduledEvolutionCycle` - Runs every 24 hours
- `triggerEvolution` - Manual trigger
- `getEvolutionStatus` - Get status
- `onApprovalUpdate` - Handles approvals
- And more...

**Note:** First deployment can take 5-10 minutes.

## Step 7: Set Up Admin User

1. Go to [Authentication](https://console.firebase.google.com/project/nmmatrix-824a3/authentication/users)
2. Note your User ID (or sign in anonymously first to create a user)
3. Go to [Firestore Database](https://console.firebase.google.com/project/nmmatrix-824a3/firestore)
4. Create a new collection: `users`
5. Document ID: `<your-user-id>` (the User ID from Authentication)
6. Add field:
   - Field: `role`
   - Type: `string`
   - Value: `admin`

## Step 8: Test the Application

1. **Refresh your browser** at http://localhost:3000
2. **Check the console** (F12) for any errors
3. **Visit the Admin Dashboard** at http://localhost:3000/admin
   - You should be able to sign in and see the dashboard
4. **Try triggering an evolution cycle** from the admin dashboard

## Step 9: Deploy to Firebase Hosting (Optional)

When ready to go live:

```bash
npm run build
npx firebase deploy --only hosting
```

## Troubleshooting

### Functions Deployment Fails

- Check that you're on the Blaze plan
- Verify your billing account is set up
- Check the logs: `npx firebase functions:log`

### Firestore Rules Not Working

- Make sure rules are deployed: `npx firebase deploy --only firestore:rules`
- Check Firestore console for any errors
- Verify you're authenticated

### Admin Access Denied

- Make sure you created a user document in Firestore
- Verify the `role` field is set to `admin`
- Check that you're signed in with the correct account

## Quick Command Reference

```bash
# Login to Firebase
npx firebase login

# Select project
npx firebase use --add

# Deploy Firestore rules and indexes
npx firebase deploy --only firestore:rules,firestore:indexes

# Build and deploy functions
cd functions && npm run build && cd ..
npx firebase deploy --only functions

# View function logs
npx firebase functions:log

# Deploy hosting
npm run build
npx firebase deploy --only hosting
```

---

**You're almost there!** Follow these steps in order, and your autonomous evolution system will be fully operational! 🚀
