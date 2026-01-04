# 🚀 Quick Start Guide - Bekkurinn

Get Bekkurinn running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Firebase project set up (see DEPLOYMENT.md for details)

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Configure Environment Variables

Create `.env.local` in the project root with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Get these from: Firebase Console → Project Settings → Your apps → SDK snippet

---

## Step 3: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** → **Get Started**
4. Enable **Google** sign-in provider
5. Add `localhost` to authorized domains

---

## Step 4: Deploy Test Security Rules

### Option A: Using Firebase CLI

```bash
# Install Firebase CLI
sudo npm install -g firebase-tools

# Login
firebase login

# Deploy test rules (for development)
firebase deploy --only firestore:rules --project your-project-id
```

### Option B: Manual (Firebase Console)

1. Go to Firebase Console → Firestore → Rules
2. Copy contents of `firestore.test.rules`
3. Paste and publish
4. **⚠️ Remember: This allows open access - development only!**

---

## Step 5: Seed Test Data

```bash
npx tsx scripts/seedSimple.ts
```

You should see:
```
✅ Seeding complete!
📋 Join code: SALA-4B
🆔 Class ID: [generated-id]
```

---

## Step 6: Start Development Server

```bash
npm run dev
```

Open: http://localhost:3000

---

## Step 7: Test the App!

1. You'll be redirected to `/is/login`
2. Click **"Skrá inn með Google"**
3. Sign in with your Google account
4. You'll be redirected to `/is/directory`
5. You should see the seeded student data
6. Click your profile photo → **Útskráning** to logout

---

## 🎉 You're All Set!

### What Works Now:
- ✅ Google Authentication
- ✅ User session management
- ✅ Logout functionality
- ✅ Real Firestore connection
- ⚠️ UI still shows mock data (needs final hookup)

### Next Steps:
1. Replace mock data in pages with React Query hooks
2. Add class selection UI
3. Implement join class flow
4. Deploy to Vercel

See `SESSION_2026-01-04.md` for detailed status.

---

## Troubleshooting

### "Permission denied" errors
- Make sure you deployed `firestore.test.rules` (open access)
- Check Firebase Console → Firestore → Rules

### "Firebase config undefined" errors
- Verify `.env.local` exists and has correct values
- Restart dev server after creating `.env.local`

### Authentication fails
- Ensure Google sign-in is enabled in Firebase Console
- Check that `localhost` is in authorized domains
- Clear browser cookies and try again

### Seed script fails
- Check Firebase project ID matches in `.env.local`
- Ensure Firestore is enabled in Firebase Console
- Verify security rules allow writes

---

## Quick Command Reference

```bash
# Development
npm run dev                      # Start dev server
npm run build                    # Build for production
npm run start                    # Run production build

# Database
npx tsx scripts/seedSimple.ts    # Seed test data

# Firebase (if CLI installed)
firebase login                   # Login to Firebase
firebase deploy --only firestore:rules  # Deploy security rules
firebase hosting:deploy          # Deploy to Firebase Hosting
```

---

## Project Structure

```
bekkurinn/
├── app/
│   └── [locale]/
│       ├── login/            # Login page
│       ├── directory/        # Student directory
│       ├── patrol/           # Calendar & patrols
│       ├── tasks/            # Event coordination
│       └── announcements/    # Notice board
├── components/
│   ├── providers/
│   │   ├── AuthProvider.tsx    # Auth context
│   │   └── QueryProvider.tsx   # React Query
│   └── navigation/
│       ├── TopHeader.tsx       # Header with logout
│       └── BottomNav.tsx       # Bottom navigation
├── services/
│   └── firestore.ts           # Database operations
├── scripts/
│   └── seedSimple.ts          # Database seeding
└── lib/
    └── firebase/
        └── config.ts          # Firebase init
```

---

## Documentation

- **README.md** - Project overview and architecture
- **PROJECT_STATUS.md** - Feature checklist
- **DEPLOYMENT.md** - Full deployment guide
- **SESSION_2026-01-04.md** - Latest work session
- **BABELFISH_FEATURE.md** - Translation feature spec

---

**Need Help?** Check the full DEPLOYMENT.md guide or SESSION files.

**Built with ❤️ for Icelandic classrooms**
