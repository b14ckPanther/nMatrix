# nmMatrix Setup Guide

This guide will help you set up and deploy nmMatrix from scratch.

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Firebase CLI** - Install via `npm install -g firebase-tools`
3. **Firebase Account** - [Sign up](https://firebase.google.com/)
4. **Git** (optional) - For version control

## Step 1: Firebase Project Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name (e.g., "nmmatrix")
   - Enable Google Analytics (optional)
   - Create project

2. **Enable Firebase Services**
   - **Firestore Database**: Create database in production mode (we'll deploy security rules later)
   - **Authentication**: Enable Anonymous auth (and Email/Password if needed for admin)
   - **Cloud Functions**: Enable (requires Blaze plan - pay-as-you-go)
   - **Hosting**: Enable
   - **Storage**: Enable
   - **Remote Config**: Enable (optional)

3. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Click the Web icon (`</>`) to add a web app
   - Copy the Firebase configuration object

## Step 2: Local Project Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd functions
   npm install
   cd ..
   ```

2. **Configure Firebase CLI**
   ```bash
   firebase login
   firebase use --add
   # Select your project when prompted
   ```

3. **Set Up Environment Variables**
   - Copy `.env.local.example` to `.env.local` (if it exists)
   - Or create `.env.local` with:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```
   - Fill in values from Firebase Console

4. **Update Firebase Configuration Files**
   - Update `.firebaserc` with your project ID:
     ```json
     {
       "projects": {
         "default": "your-project-id"
       }
     }
     ```

5. **Configure Firebase Admin (for Cloud Functions)**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - **DO NOT commit this file to Git**
   - Set environment variable in Firebase Functions:
     ```bash
     firebase functions:config:set admin.key="path/to/your/service-account-key.json"
     ```
   - Or use Firebase Admin SDK with default credentials (recommended)

## Step 3: Deploy Firestore Rules and Indexes

1. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Firestore Indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

   Note: Indexes may take a few minutes to build.

## Step 4: Initialize Firestore Collections

Create the initial configuration document:

```bash
# Using Firebase Console or Firebase CLI
firebase firestore:set configs/evolution \
  '{"enabled": true, "intervalHours": 24, "maxMutationsPerCycle": 5, "minCostFunctionScore": 0.6}'
```

Or via Firebase Console:
1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: `configs`
4. Document ID: `evolution`
5. Add fields:
   - `enabled` (boolean): `true`
   - `intervalHours` (number): `24`
   - `maxMutationsPerCycle` (number): `5`
   - `minCostFunctionScore` (number): `0.6`

## Step 5: Build and Deploy Cloud Functions

1. **Build Functions**
   ```bash
   cd functions
   npm run build
   cd ..
   ```

2. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   ```

   This will deploy:
   - `scheduledEvolutionCycle` - Runs every 24 hours
   - `triggerEvolution` - Manual trigger (admin only)
   - `getEvolutionStatus` - Get evolution status
   - `onApprovalUpdate` - Handles approval updates
   - `assignExperimentVariant` - A/B testing variant assignment
   - `trackAnalyticsEvent` - Analytics event tracking

## Step 6: Set Up Admin User

1. **Sign in to your app** (or create an account)

2. **Get your User ID** from Firebase Console > Authentication

3. **Set admin role** in Firestore:
   - Go to Firestore Database
   - Collection: `users`
   - Document ID: `<your-user-id>`
   - Add field:
     - `role` (string): `admin`

Or via Firebase CLI:
```bash
firebase firestore:set users/YOUR_USER_ID '{"role": "admin"}'
```

## Step 7: Build and Deploy Frontend

1. **Test Locally**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy --only hosting
   ```

   Note: Update `firebase.json` to use `out` directory for Next.js static export if needed.

## Step 8: Configure Next.js for Static Export (Optional)

If you want to use Firebase Hosting for static export:

1. Update `next.config.js`:
   ```javascript
   const nextConfig = {
     output: 'export', // Enable static export
     // ... rest of config
   };
   ```

2. Rebuild and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Step 9: Verify Deployment

1. **Check Firebase Console**
   - Functions: Should show all deployed functions
   - Firestore: Should have collections ready
   - Hosting: Should show your site URL

2. **Test Admin Dashboard**
   - Visit `/admin` page
   - Sign in with admin account
   - Should see admin dashboard

3. **Trigger Manual Evolution Cycle**
   - Click "Trigger Evolution Cycle" in admin dashboard
   - Check Cloud Functions logs for execution

## Step 10: Monitor and Maintain

1. **Monitor Cloud Functions**
   ```bash
   firebase functions:log
   ```

2. **Check Firestore Data**
   - Monitor `/versions` collection for evolution history
   - Monitor `/approvals` for pending approvals
   - Monitor `/analytics` for A/B testing data

3. **Review Evolution Cycles**
   - Check admin dashboard regularly
   - Review pending approvals
   - Monitor cost function scores

## Troubleshooting

### Functions Deployment Fails
- Check Node.js version (must be 18+)
- Verify Firebase CLI is up to date: `firebase-tools --version`
- Check functions code for syntax errors: `cd functions && npm run lint`

### Firestore Rules Not Working
- Verify rules are deployed: `firebase deploy --only firestore:rules`
- Check Firestore security rules in console
- Verify user authentication

### Admin Access Denied
- Verify user document exists in `users` collection
- Check `role` field is set to `admin`
- Ensure user is authenticated

### Environment Variables Not Working
- Verify `.env.local` file exists
- Check variable names start with `NEXT_PUBLIC_` for client-side
- Restart dev server after changes

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## Next Steps

1. **Customize Evolution Logic**
   - Modify Cloud Functions in `functions/src/evolution/`
   - Adjust cost function weights
   - Update mutation types

2. **Set Up CI/CD**
   - Use GitHub Actions or similar
   - Auto-deploy on push to main branch

3. **Configure Monitoring**
   - Set up Firebase Performance Monitoring
   - Configure alerts for errors
   - Monitor function execution times

4. **Scale Up**
   - Adjust evolution cycle frequency
   - Increase mutation limits
   - Add more experiment variants

## Security Considerations

- **Never commit** `.env.local` or service account keys
- **Review Firestore rules** regularly
- **Monitor function logs** for suspicious activity
- **Limit admin access** to trusted users
- **Enable Firebase App Check** for production

## Support

For issues or questions:
- Check [README.md](./README.md) for architecture details
- Review Cloud Functions logs
- Check Firebase Console for errors
- Consult Firebase documentation

---

**Note**: This is an experimental system. Monitor closely and ensure proper safety mechanisms are in place.
