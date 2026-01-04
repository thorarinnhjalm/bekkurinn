# 🔥 Firestore Setup Guide

## Step 1: Deploy Security Rules

1. Go to Firebase Console: `https://console.firebase.google.com/project/bekkurinn-7f951/firestore`
2. Click on **"Rules"** tab
3. Copy the contents of `firestore.rules` and paste into the editor
4. Click **"Publish"**

## Step 2: Create Initial Test Data

Since we're in development mode, you can start with test mode rules to seed data manually:

### Option A: Use Test Mode (Temporary - For Development Only)

1. In Firestore → Rules, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

2. Click **"Publish"**
3. ⚠️ **Remember to replace with proper rules from `firestore.rules` before going live!**

### Option B: Manual Data Creation

Go to Firestore → Data and create these collections manually:

#### 1. Create a Class

Collection: `classes`

```json
{
  "joinCode": "SALA-4B",
  "name": "Salaskóli 4. Bekkur",
  "admins": ["YOUR_USER_ID_HERE"],
  "confidentialityAgreedAt": <Timestamp: now>,
  "pactText": "Við samþykkjum að fara með allar upplýsingar með trúnaði.",
  "createdAt": <Timestamp: now>
}
```

Copy the auto-generated document ID (this is your `classId`)

#### 2. Create Students

Collection: `students`

Document 1:
```json
{
  "classId": "YOUR_CLASS_ID_FROM_STEP_1",
  "name": "Jón Jónsson",
  "birthDate": <Timestamp: 2016-01-15>,
  "dietaryNeeds": ["peanut"],
  "photoPermission": "allow",
  "createdAt": <Timestamp: now>
}
```

Document 2:
```json
{
  "classId": "YOUR_CLASS_ID_FROM_STEP_1",
  "name": "Anna Sigurðardóttir",
  "birthDate": <Timestamp: 2016-03-22>,
  "dietaryNeeds": [],
  "photoPermission": "allow",
  "createdAt": <Timestamp: now>
}
```

#### 3. Create a Patrol Task

Collection: `tasks`

```json
{
  "classId": "YOUR_CLASS_ID_FROM_STEP_1",
  "type": "rolt",
  "title": "Foreldrarölt",
  "description": "Vaktagátt um hverfið",
  "date": <Timestamp: 2026-01-15 16:00>,
  "slotsTotal": 2,
  "slotsFilled": 0,
  "volunteers": [],
  "createdBy": "demo-admin",
  "createdAt": <Timestamp: now>
}
```

#### 4. Create an Announcement

Collection: `announcements`

```json
{
  "classId": "YOUR_CLASS_ID_FROM_STEP_1",
  "title": "Foreldrafundur",
  "content": "Næsti foreldrafundur er 15. janúar kl. 19:00 í matsalnum.",
  "pinned": true,
  "createdBy": "demo-admin",
  "author": "Guðrún (Formaður)",
  "createdAt": <Timestamp: now>
}
```

## Step 3: Update App to Use Real Data

Once you have test data, the app will automatically fetch it using React Query hooks!

The Directory, Patrol, Tasks, and Announcements pages are already configured to use:
- `useStudents(classId)` → Fetches students
- `useTasks(classId)` → Fetches patrol/events
- `useAnnouncements(classId)` → Fetches announcements

## Step 4: Hard-code ClassId for Testing

For now, you'll need to hard-code your `classId` in the component files. Later, we'll add:
- User authentication
- Class selection/join flow
- Persistent class membership

## Next Steps

After manual seeding:
1. ✅ Verify data appears in the app
2. 🔒 Deploy proper security rules from `firestore.rules`
3. 👤 Add authentication (Google OAuth + Magic Links)
4. 🎯 Build onboarding flow (join class via joinCode)

---

**Quick Test:**
1. Add test data manually in Firebase Console
2. Hard-code `const classId = 'YOUR_CLASS_ID'` in `directory/page.tsx`
3. Refresh `localhost:3000/directory`
4. You should see real students! 🎉
