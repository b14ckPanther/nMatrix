# nmMatrix - Autonomous Self-Evolving Web Application

nmMatrix is a fully autonomous, self-evolving web application that continuously scans, critiques, modifies, improves, deploys, and evolves itself without human intervention. It represents a groundbreaking experiment in autonomous software evolution.

## 🌟 Overview

nmMatrix operates as a living digital organism through an endless **Evolution Loop**:

1. **Self-Inspection**: AI modules analyze the entire codebase, UI, UX, SEO, accessibility, performance, content quality, images, and folder structure
2. **Self-Critique**: AI generates natural-language critiques describing inefficiencies, outdated patterns, poor design, redundancies, low performance, unclear content, or aesthetic weaknesses
3. **Self-Modification**: AI generates production-ready code improvements (React components, Next.js pages, Tailwind styling, configuration updates, Firebase Cloud Functions, Firestore schema adjustments, SEO metadata, content rewrites, performance optimizations)
4. **Evolution & Deployment**: Validated changes are applied and deployed autonomously
5. **Version DNA**: Every iteration is stored in Firestore including reasoning, diffs, metrics, performance before/after, mutation types, and lineage, forming a digital DNA tree

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **TailwindCSS v3.4.4** (strictly v3.4.4, not v4 beta)
- **Firebase SDK** for client-side operations
- Modular, accessible React component architecture

### Backend
- **Firebase Firestore** (NoSQL) - Database
- **Firebase Cloud Functions** - All AI logic runs here
- **Firebase Hosting** - Static hosting
- **Firebase Auth** - User authentication and admin approval
- **Firebase Storage** - Code snapshots and assets
- **Firebase Remote Config** - Configuration management
- **Zero external servers** - Everything runs on Firebase

### Firestore Collections

- `/versions` - Version history with DNA tracking
- `/reviews` - AI-generated critiques
- `/mutations` - Proposed code changes
- `/snapshots` - Codebase snapshots
- `/configs` - System configuration
- `/approvals` - Pending/admin approvals
- `/experiments` - A/B testing configurations
- `/analytics` - User behavior analytics

## 🔄 Evolution Loop

The system runs scheduled evolution cycles (default: every 24 hours) through Cloud Functions:

1. **Self-Inspection** (`self-inspection.ts`)
   - Analyzes codebase structure, quality, dependencies
   - Checks UI accessibility and design consistency
   - Evaluates UX navigation and performance metrics
   - Reviews SEO metadata and content quality
   - Examines folder organization

2. **Self-Critique** (`self-critique.ts`)
   - Generates natural-language critiques from inspection results
   - Categorizes issues by severity (low, medium, high, critical)
   - Suggests specific improvements
   - Prioritizes reviews for maximum impact

3. **Self-Modification** (`self-modification.ts`)
   - Generates production-ready code improvements
   - Creates mutations with diffs, reasoning, and estimated impact
   - Maps critiques to specific mutation types
   - Ensures code quality and safety

4. **Cost Function** (`cost-function.ts`)
   - Evaluates mutations using weighted scoring
   - Measures improvements in performance, UX, SEO, accessibility, stability, bundle size
   - Prevents harmful or unnecessary mutations
   - Requires minimum threshold score (default: 0.6) for approval

5. **Approval Layer** (`approval-handler.ts`)
   - Admin can approve, reject, or partially accept mutations
   - Integrates with Firebase Auth for admin authentication
   - Tracks approval history and feedback

6. **Deployment** (`deployment-handler.ts`)
   - Validates mutations (prevents self-destruction)
   - Applies approved mutations to codebase
   - Deploys to Firebase Hosting
   - Updates version DNA with metrics
   - Creates snapshots for rollback capability

## 🛡️ Safety Mechanisms

- **Validation Steps**: All mutations are validated before deployment
- **Preview Builds**: Changes are tested before going live
- **Git-like Diff Checks**: Changes are reviewed and tracked
- **Mutation Throttling**: Limits number of mutations per cycle
- **Cost Function**: Prevents harmful mutations through scoring
- **Dangerous Pattern Detection**: Blocks self-destructive code
- **Moderation Filters**: All generated text passes content moderation

## 🎨 Features

### Dynamic Theming
- AI-driven Light/Dark mode evolution
- CSS variable-based theming system
- Theme persistence in localStorage

### A/B Testing
- Automatic A/B testing of different mutations
- Behavior analytics saved to Firestore
- Variant performance tracking

### Admin Dashboard
- View pending approvals
- Review evolution history
- Trigger manual evolution cycles
- Monitor system status

### Evolution Viewer
- See latest evolution versions
- View mutations and critiques
- Track version DNA lineage
- Monitor cost function scores

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase CLI
- Firebase project with Firestore, Functions, Hosting, Auth, Storage enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nmMatrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Configure Firebase**
   - Copy `.firebaserc` and update with your project ID
   - Set up Firebase configuration in `.env.local`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. **Deploy Firestore rules and indexes**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

5. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions
   ```

6. **Initialize admin user**
   - Sign in via Firebase Auth
   - Update user document in Firestore:
     ```javascript
     // In Firebase Console or via Cloud Function
     db.collection('users').doc('USER_ID').set({
       role: 'admin'
     })
     ```

7. **Run development server**
   ```bash
   npm run dev
   ```

8. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

9. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy --only hosting
   ```

## 📊 Monitoring

- View evolution status at `/admin`
- Check version history at `/evolution`
- Monitor Cloud Functions logs: `firebase functions:log`
- Track Firestore data in Firebase Console

## 🎯 Use Cases

- **Startups**: Automatic maintenance and optimization
- **Artists**: Living art websites that evolve over time
- **UX/HCI Researchers**: Studying evolving interfaces
- **Educators**: Adaptive learning sites
- **Philosophy/Technology Experiments**: Exploring whether software can "live"

## ⚙️ Configuration

Evolution system configuration is stored in Firestore `/configs/evolution`:

```javascript
{
  enabled: true,
  intervalHours: 24,
  maxMutationsPerCycle: 5,
  minCostFunctionScore: 0.6
}
```

## 🔐 Security

- All admin operations require Firebase Auth
- Firestore security rules enforce admin-only mutations
- Cloud Functions verify admin status before operations
- Moderation filters prevent harmful content generation

## 📝 Version DNA

Each version stores:
- Version number and lineage
- Reasoning for creation
- Mutations applied
- Performance metrics (before/after)
- Cost function score
- Approval status
- Deployment timestamp

## 🧪 A/B Testing

The system supports automatic A/B testing:
- Variants are created from different mutations
- Traffic is split according to configuration
- Analytics track user behavior
- Performance metrics are compared
- Winning variants are promoted

## 🚧 Development Notes

- TailwindCSS is strictly v3.4.4 (not v4 beta)
- All AI logic runs in Cloud Functions (not client-side)
- The system is designed to prevent self-destruction
- Every change is tracked in Version DNA
- Evolution cycles can be triggered manually via admin dashboard

## 📄 License

[Your License Here]

## 🤝 Contributing

This is an experimental project exploring autonomous software evolution. Contributions welcome!

## 🙏 Acknowledgments

Built with Next.js, React, TailwindCSS, and Firebase. Inspired by the concept of living, evolving software.

---

**Note**: This is a groundbreaking experimental system. Monitor closely and ensure proper safety mechanisms are in place before production use.
