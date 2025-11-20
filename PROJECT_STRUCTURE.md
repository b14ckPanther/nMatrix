# nmMatrix Project Structure

This document provides an overview of the project structure and key files.

## Directory Structure

```
nmMatrix/
├── functions/                  # Firebase Cloud Functions
│   ├── src/
│   │   ├── evolution/         # Evolution Loop Functions
│   │   │   ├── self-inspection.ts      # Step 1: Analyze codebase
│   │   │   ├── self-critique.ts        # Step 2: Generate critiques
│   │   │   ├── self-modification.ts    # Step 3: Generate mutations
│   │   │   ├── cost-function.ts        # Step 4: Evaluate mutations
│   │   │   ├── evolution-cycle.ts      # Orchestrator
│   │   │   ├── approval-handler.ts     # Handle approvals
│   │   │   └── deployment-handler.ts   # Deploy approved mutations
│   │   ├── ab-testing/        # A/B Testing Functions
│   │   │   └── experiment-manager.ts   # Experiment management
│   │   └── index.ts           # Functions entry point
│   ├── package.json
│   └── tsconfig.json
│
├── src/                        # Next.js Frontend
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   ├── admin/            # Admin pages
│   │   │   └── page.tsx      # Admin dashboard
│   │   ├── globals.css       # Global styles
│   │   └── providers.tsx     # Theme/context providers
│   │
│   ├── components/           # React Components
│   │   ├── admin/           # Admin components
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── approval-list.tsx
│   │   │   └── versions-list.tsx
│   │   ├── evolution/       # Evolution components
│   │   │   ├── evolution-status.tsx
│   │   │   └── latest-versions.tsx
│   │   ├── home/            # Homepage components
│   │   │   ├── hero.tsx
│   │   │   └── features.tsx
│   │   ├── theme/           # Theme components
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   └── ui/              # UI components
│   │       └── loading-spinner.tsx
│   │
│   ├── hooks/               # React Hooks
│   │   └── use-auth.ts      # Authentication hook
│   │
│   ├── lib/                 # Utility Libraries
│   │   ├── firebase/        # Firebase utilities
│   │   │   ├── client.ts    # Client-side Firebase config
│   │   │   ├── firestore.ts # Firestore helpers
│   │   │   └── functions.ts # Cloud Functions client
│   │   ├── ab-testing/      # A/B Testing utilities
│   │   │   └── experiment.ts
│   │   ├── theme.ts         # Theme utilities
│   │   └── utils.ts         # General utilities
│   │
│   └── types/               # TypeScript Types
│       └── evolution.ts     # Evolution system types
│
├── firebase.json            # Firebase configuration
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── storage.rules           # Storage security rules
├── .firebaserc            # Firebase project config
│
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # TailwindCSS configuration (v3.4.4)
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
│
├── README.md               # Project documentation
├── SETUP.md                # Setup guide
└── PROJECT_STRUCTURE.md    # This file
```

## Key Files Explained

### Evolution Loop (`functions/src/evolution/`)

1. **self-inspection.ts**
   - Analyzes codebase, UI, UX, SEO, accessibility, performance
   - Generates inspection results
   - Stores results in Firestore

2. **self-critique.ts**
   - Generates natural-language critiques from inspection
   - Categorizes issues by severity and type
   - Creates Review documents in Firestore

3. **self-modification.ts**
   - Generates mutations (code changes) from critiques
   - Creates Mutation documents with diffs
   - Maps critiques to specific mutation types

4. **cost-function.ts**
   - Evaluates mutations using weighted scoring
   - Prevents harmful mutations
   - Returns score and approval status

5. **evolution-cycle.ts**
   - Orchestrates the entire evolution loop
   - Coordinates inspection → critique → modification → evaluation
   - Creates Version DNA documents

6. **approval-handler.ts**
   - Processes admin approvals
   - Updates version status
   - Triggers deployment

7. **deployment-handler.ts**
   - Validates mutations
   - Applies changes to codebase
   - Deploys to Firebase Hosting
   - Creates snapshots

### Frontend Components (`src/components/`)

- **Admin Dashboard**: Manage approvals, view versions, trigger evolution
- **Evolution Status**: Display current evolution state
- **Latest Versions**: Show version history
- **Theme Components**: Light/Dark mode toggle and provider

### Firebase Collections

1. **`/versions`** - Version history with DNA tracking
2. **`/reviews`** - AI-generated critiques
3. **`/mutations`** - Proposed code changes
4. **`/snapshots`** - Codebase snapshots
5. **`/configs`** - System configuration
6. **`/approvals`** - Pending/admin approvals
7. **`/experiments`** - A/B testing configurations
8. **`/analytics`** - User behavior analytics
9. **`/users`** - User data and roles

### Configuration Files

- **`firebase.json`**: Firebase project configuration
- **`firestore.rules`**: Security rules for Firestore
- **`firestore.indexes.json`**: Database indexes
- **`storage.rules`**: Security rules for Storage
- **`next.config.js`**: Next.js configuration
- **`tailwind.config.ts`**: TailwindCSS v3.4.4 configuration
- **`tsconfig.json`**: TypeScript configuration

## Data Flow

### Evolution Cycle

```
1. Scheduled Trigger (every 24 hours)
   ↓
2. Self-Inspection
   ↓
3. Self-Critique → Reviews
   ↓
4. Self-Modification → Mutations
   ↓
5. Cost Function Evaluation
   ↓
6. Create Version DNA
   ↓
7. Create Approval Request
   ↓
8. Admin Reviews & Approves
   ↓
9. Deployment Handler
   ↓
10. Deploy to Production
```

### User Flow

```
Homepage (/)
  ↓
Admin Dashboard (/admin)
  ↓
View Pending Approvals
  ↓
Review & Approve Mutations
  ↓
Mutations Deployed
  ↓
Version DNA Updated
```

## Key Concepts

### Version DNA
Every version stores:
- Version number and lineage
- Reasoning for creation
- Mutations applied
- Performance metrics (before/after)
- Cost function score
- Approval and deployment status

### Cost Function
Evaluates mutations based on:
- Performance improvements (25%)
- UX improvements (25%)
- SEO improvements (15%)
- Accessibility improvements (15%)
- Stability improvements (15%)
- Bundle size reduction (5%)

### Safety Mechanisms
- Validation steps before deployment
- Preview builds
- Git-like diff checks
- Mutation throttling
- Dangerous pattern detection
- Moderation filters

## Extension Points

### Adding New Mutation Types
1. Update `MutationType` in `src/types/evolution.ts`
2. Add handling in `self-modification.ts`
3. Update mutation type colors in `src/lib/utils.ts`

### Customizing Evolution Logic
1. Modify inspection logic in `self-inspection.ts`
2. Adjust critique generation in `self-critique.ts`
3. Update cost function weights in `cost-function.ts`

### Adding New Features
1. Create components in `src/components/`
2. Add types in `src/types/`
3. Update Firestore schema if needed
4. Add Cloud Functions if backend logic required

## Development Workflow

1. **Frontend Development**
   ```bash
   npm run dev
   ```

2. **Functions Development**
   ```bash
   cd functions
   npm run build
   npm run serve
   ```

3. **Type Checking**
   ```bash
   npm run type-check
   ```

4. **Linting**
   ```bash
   npm run lint
   cd functions && npm run lint
   ```

5. **Deployment**
   ```bash
   # Deploy everything
   firebase deploy

   # Deploy specific service
   firebase deploy --only functions
   firebase deploy --only hosting
   firebase deploy --only firestore:rules
   ```

## Notes

- **TailwindCSS v3.4.4**: Strictly use v3.4.4, not v4 beta
- **Cloud Functions**: All AI logic runs in Cloud Functions, not client-side
- **Firebase Only**: No external servers, everything runs on Firebase
- **Admin Access**: Controlled via Firebase Auth and Firestore `users` collection
- **Version Control**: Every change tracked in Version DNA for full lineage
