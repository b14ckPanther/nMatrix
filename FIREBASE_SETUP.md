# Firebase Setup Guide - Quick Start

## 🔴 Current Issue
Your app is showing: `FirebaseError: Firebase: Error (auth/invalid-api-key)`

This means Firebase is not configured yet. Follow these steps to fix it.

## ✅ Step 1: Create Firebase Project

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create a New Project:**
   - Click "Add project" or "Create a project"
   - Enter project name: `nmmatrix` (or any name you like)
   - Click "Continue"
   - Disable Google Analytics (optional - can enable later)
   - Click "Create project"
   - Wait for project creation (30 seconds)

## ✅ Step 2: Register Web App

1. **In your Firebase project dashboard**, click the **Web icon** (`</>`):
   - It's in the "Get started by adding Firebase to your app" section
   - Or go to Project Settings > General > Your apps

2. **Register your app:**
   - App nickname: `nmMatrix Web`
   - Check "Also set up Firebase Hosting" (optional for now)
   - Click "Register app"

3. **Copy the Firebase configuration:**
   - You'll see a code block with `firebaseConfig`
   - It looks like:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:abcdef123456",
       measurementId: "G-XXXXXXXXXX"
     };
     ```

## ✅ Step 3: Create .env.local File

1. **In your project directory**, create a file named `.env.local`:
   ```bash
   cd /Users/zangeel/Desktop/nmMatrix
   touch .env.local
   ```

2. **Copy the template:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Open `.env.local` in a text editor** and fill in your Firebase values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your_actual_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

   **Important:** Replace all the placeholder values with your actual Firebase config values!

## ✅ Step 4: Enable Firebase Services

In Firebase Console, enable these services:

### A. Firestore Database
1. Go to **Firestore Database** in the left menu
2. Click **Create database**
3. Choose **Production mode** (we'll deploy security rules later)
4. Select a location (choose closest to you)
5. Click **Enable**

### B. Authentication
1. Go to **Authentication** in the left menu
2. Click **Get started**
3. Enable **Anonymous** sign-in:
   - Click on "Anonymous"
   - Toggle to **Enabled**
   - Click **Save**

### C. Cloud Functions
1. Go to **Functions** in the left menu
2. Click **Get started**
3. You'll need to upgrade to the **Blaze plan** (pay-as-you-go)
   - Don't worry - you get a free tier with generous limits
   - You won't be charged unless you exceed the free tier
4. Follow the prompts to enable Functions

### D. Storage
1. Go to **Storage** in the left menu
2. Click **Get started**
3. Use default security rules (we'll deploy custom rules later)
4. Choose a location and click **Done**

## ✅ Step 5: Restart Development Server

1. **Stop your current dev server:**
   - Press `Ctrl+C` in the terminal where it's running

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Refresh your browser** - The Firebase error should be gone!

## ✅ Step 6: Deploy Firestore Rules

After Firebase is configured, deploy the security rules:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 🎉 Success!

Once configured, your app should:
- ✅ Load without Firebase errors
- ✅ Connect to Firestore
- ✅ Enable authentication
- ✅ Show evolution status (may be empty at first)

## 🔍 Verify Setup

After restarting, check the browser console:
- ✅ No Firebase errors
- ✅ You should see: "Firebase initialized successfully" (if we add logging)

## 🆘 Troubleshooting

### Still getting "invalid-api-key" error?

1. **Make sure `.env.local` exists:**
   ```bash
   ls -la .env.local
   ```

2. **Check your environment variables are set:**
   ```bash
   # In your .env.local file, make sure values don't have quotes:
   # ✅ Correct: NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   # ❌ Wrong: NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
   ```

3. **Restart the dev server** - Next.js only reads `.env.local` on startup

4. **Check for typos** - Make sure variable names start with `NEXT_PUBLIC_`

### Can't see Firestore in Firebase Console?

- Make sure you selected the correct project
- Try refreshing the page
- Check if you have the right permissions

### "Permission denied" errors?

- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Make sure you're authenticated as admin (if accessing admin features)

## 📚 Next Steps

After Firebase is configured:
1. Set up an admin user (see `SETUP.md`)
2. Deploy Cloud Functions: `firebase deploy --only functions`
3. Configure evolution system settings

---

**Quick Command Reference:**
```bash
# Create .env.local
cp .env.local.example .env.local

# Edit .env.local (use any text editor)
nano .env.local
# or
code .env.local

# Restart dev server
npm run dev
```
