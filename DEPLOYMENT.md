# 🚀 Deployment Guide - Bekkurinn

Complete guide for deploying Bekkurinn to production.

## Prerequisites

- Node.js 18+ installed
- Firebase account (free Spark plan works)
- Firebase project created (`bekkurinn-7f951` or your own)

---

## Step 1: Firebase Setup

### A. Install Firebase CLI

```bash
# Install globally (requires sudo on Mac/Linux)
sudo npm install -g firebase-tools

# OR use npx (no installation needed)
npx firebase-tools
```

### B. Login to Firebase

```bash
firebase login
```

### C. Initialize Firebase in Your Project

```bash
cd bekkurinn
firebase init
```

Select:
- **Firestore** - Configure security rules
- **Hosting** (optional) - For static site hosting

When prompted:
- Use existing project: `bekkurinn-7f951` (or your project ID)
- Firestore rules file: `firestore.rules`
- Don't overwrite existing files

---

## Step 2: Deploy Firestore Security Rules

### Test Mode (Development Only - ⚠️ INSECURE!)

For initial testing, you can temporarily use open rules:

```bash
# Deploy test mode rules
firebase deploy --only firestore:rules --project bekkurinn-7f951 -m "TEST MODE - Open access"
```

This uses `firestore.test.rules` which allows all reads/writes.

**⚠️ WARNING: NEVER use test mode rules in production!**

### Production Mode

Once authentication is set up, deploy the secure rules:

```bash
# Deploy production rules
firebase deploy --only firestore:rules --project bekkurinn-7f951
```

This uses `firestore.rules` with proper role-based access control.

---

## Step 3: Enable Firebase Authentication

### Via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`bekkurinn-7f951`)
3. Click **Authentication** in left sidebar
4. Click **Get Started**
5. Enable **Google** sign-in provider:
   - Click **Google**
   - Toggle to **Enabled**
   - Set support email (your email)
   - Click **Save**

### Configure Authorized Domains

Make sure these domains are authorized:
- `localhost` (for development)
- Your production domain (e.g., `bekkurinn.vercel.app`)

---

## Step 4: Seed Database with Test Data

### Run the Seed Script

```bash
# Simple seed script (recommended)
npx tsx scripts/seedSimple.ts

# OR original seed script
npx tsx scripts/seed.ts
```

This will create:
- 1 demo class ("Salaskóli 4. Bekkur")
- 5 students with dietary info
- 3 patrol tasks
- 1 event
- 3 announcements

**Output should show:**
```
✅ Seeding complete!
📋 Join code: SALA-4B
🆔 Class ID: [generated-id]
🔗 Test at: http://localhost:3000/is/directory
```

---

## Step 5: Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

You should be redirected to `/is/login`

---

## Step 6: Test Authentication

1. Click **"Skrá inn með Google"**
2. Sign in with your Google account
3. You should be redirected to `/is/directory`
4. The header should show your profile photo/initial
5. Click your photo → **Útskráning** to log out

---

## Step 7: Deploy to Vercel

### A. Install Vercel CLI (optional)

```bash
npm i -g vercel
```

### B. Deploy

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

**OR** connect your GitHub repo to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings
4. Add environment variables (see below)
5. Deploy!

### C. Environment Variables (Vercel Dashboard)

Add these in Vercel's project settings:

```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
```

Get these from Firebase Console → Project Settings → General → Your apps → Firebase SDK snippet

---

## Troubleshooting

### "Firebase not found" error

```bash
# Use npx instead
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

### Seed script errors

Check:
- `.env.local` file exists with correct Firebase config
- Firebase project ID is correct
- Firestore test mode rules are deployed (for initial testing)

### Authentication fails

Verify:
- Google sign-in is enabled in Firebase Console
- `localhost` is in authorized domains
- Environment variables are set correctly

### Permission denied errors

- Make sure you're deploying the test mode rules first for development
- Check Firebase Console → Firestore → Rules tab to verify deployment

---

## Production Checklist

Before going live:

- [ ] Deploy `firestore.rules` (NOT `firestore.test.rules`)
- [ ] Enable Google Authentication
- [ ] Add production domain to authorized domains
- [ ] Set all environment variables in Vercel
- [ ] Test authentication flow
- [ ] Test data read/write permissions
- [ ] Add your admin UID to class.admins array
- [ ] Remove or secure demo data

---

## Useful Commands

```bash
# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only hosting
firebase deploy --only hosting

# View deployment history
firebase hosting:list

# Check current rules
firebase firestore:rules:get

# Build for production
npm run build

# Run production build locally
npm run start
```

---

**Need Help?**

Check the documentation:
- `PROJECT_STATUS.md` - Feature overview
- `FIRESTORE_SETUP.md` - Database schema
- `README.md` - Architecture details

Built with ❤️ for Icelandic classrooms
