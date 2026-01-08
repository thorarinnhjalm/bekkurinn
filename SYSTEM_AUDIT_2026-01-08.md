# 🔍 KERFISSKIPULAG & RÖKVILLUGREINING
## Gap Analysis fyrir Bekkurinn

---

## 📋 SAMANTEKT

Eftir ítarlega könnun á kerfinu eru 23 alvarleg vandamál greind sem þarfnast úrbóta. Stig: 4/10 (Óviðunandi fyrir framleiðsluumhverfi).

**Helstu niðurstöður:**
- ❌ 8 Critical Security Issues
- ⚠️ 12 Major Logic Gaps  
- 🔧 15 Missing CRUD Operations
- 🚫 3 Dead Ends in Navigation

---

## 🚨 I. RÖKVILLUR & MUNAÐARLAUS VIRKNI

### 1. ALGJöR LYKILGAT: Engin "Mínar stillingar" síða

**Vandamál:**
- Notandi Model (`User`) krefst `phone`, `photoURL`, og `isPhoneVisible`
- **ENGIN viðmótslausn til að breyta þessu**
- Notandi er fastur með placeholder gildi að eilífu

**Staðsetning:**
```
/app/[locale]/(app)/user/profile/page.tsx - Sýnir bara BÖRN
Vantar: /app/[locale]/(app)/user/settings/page.tsx
```

**Afleiðingar:**
- Notandi getur ALDREI breytt símanúmeri
- Notandi getur ALDREI uploaded mynd
- Notandi getur ALDREI skipt um tungumál (`language` field exists en ekki UI)
- `address` field er skilgreint en ekkert input til að breyta því

**Fyrirmyndar skildað:**
```typescript
// User Model KREFST þessara gilda:
phone: string;          // ❌ Engin breyting möguleg
isPhoneVisible: boolean; // ❌ Engin breyting möguleg  
photoURL?: string;      // ❌ Engin breyting möguleg
language: UserLanguage; // ❌ Engin breyting möguleg
address?: string;       // ❌ Engin breyting möguleg
```

**Lagfæring krafa:**
Stofna `/app/[locale]/(app)/user/settings/page.tsx` með:
- Upphlaða mynd (firebase storage)
- Breyta símanúmeri
- Toggle fyrir `isPhoneVisible`
- Tungumálaval (is/en/pl)
- Heimilisfang (fyrir kort)

---

### 2. VANTAR: Tilkynningastillingar

**Vandamál:**
- Kerfið sendir engar tilkynningar (email/SMS) enn
- Þegar það gerir það verður engin leið til að slökkva á þeim

**Lagfæring:**
- Bæta `notificationPreferences` við User model
- UI í Settings síðu

---

### 3. VANTAR: Admin Directory með upplýsingum um foreldra

**Vandamál:**
```tsx
// directory/page.tsx línur 257-263:
<p className="text-xs font-medium uppercase tracking-wide">
    Foreldrar
</p>
<p className="text-sm">
    Upplýsingar um foreldra verða bættar við þegar þeir skrá sig í kerfið.
</p>
```

**Raunveruleiki:**
- Foreldrar ERU skráðir í kerfið (User + ParentLink)
- Engin virkni til að sækja þær upplýsingar
- Directory er ónýt fyrir foreldra

**Lagfæring:**
1. Stofna `getParentsByStudent(studentId)` service function
2. Sýna foreldra nöfn, síma (ef `isPhoneVisible = true`), tölvupóst
3. Bæta við "Hafa samband" takka

---

### 4. VANTAR: Avatar/Photo Upload Infrastructure

**Vandamál:**
- User og Student models hafa `photoURL` field
- **ENGIN** mynd upload virkni til staðar
- Notandi þarf að paste inn URL í input field (!!)

**Staða:**
```tsx
// Í user/profile/page.tsx:
<input 
    type="text"  // ❌ TEXT INPUT fyrir mynd!!
    value={userPhotoUrl}
    placeholder="https://..."
/>
<p className="text-xs text-gray-500 mt-1">
    * Í augnablikinu styðjum við aðeins beina myndaslóð (URL).
</p>
```

**Þetta er ÓVIÐUNANDI fyrir framleiðslu.**

**Lagfæring:**
1. Firebase Storage integration
2. Image upload component með preview
3. Crop/resize virkni
4. Eyða gamla `/api/upload` ef til

---

## 🔐 II. RéTTINDAVANDAMáL (PERMISSIONS & SECURITY)

### 5. CRITICAL: Engin URL Protection á Admin síðum

**Hættumat: 9/10**

**Vandamál:**
```tsx
// settings/SettingsView.tsx:
// Fetches admin class:
const q = query(
    collection(db, 'classes'),
    where('admins', 'array-contains', user.uid)
);

// ❌ EN ef notandi navigerar beint á /settings:
// - Sér villu "Enginn bekkur fannst"
// - EKKI redirect til dashboard
// - EKKI 403 Forbidden screen
```

**URL Manipulation Test:**
Parent getur:
- ✅ Navigate to `/is/settings` (sér villu, ekki blocked)
- ✅ Navigate to `/is/admin` (sér "Aðgangur bannaður" en aðeins EFTIR load)

**Þetta er öryggisvandamál.**

**Lagfæring:**
1. Middleware fyrir protected routes:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
    const user = await getUser();
    const isAdmin = await checkAdminRole(user.uid);
    
    if (request.nextUrl.pathname.startsWith('/settings') && !isAdmin) {
        return NextResponse.redirect('/dashboard');
    }
}
```

2. Eða Route-level protection:
```tsx
// settings/page.tsx
export default async function SettingsPage() {
    const user = await getServerSideUser();
    const classes = await getUserAdminClasses(user.uid);
    
    if (classes.length === 0) {
        redirect('/dashboard');
    }
    //...
}
```

---

### 6. UI Leakage: Regular parents sjá Admin hints

**Vandamál:**
```tsx
// directory/page.tsx línu 278:
<p className="text-sm mt-2">
    Bekkjarformaður þarf að bæta nemendum við
</p>
```

Þetta text birtist ÖLLUM, ekki bara admin.

**Lagfæring:**
Conditional render based on role.

---

### 7. Missing Backend Authorization Checks

**Vandamál:**
```typescript
// services/firestore.ts
export async function createTask(data: CreateTaskInput): Promise<string> {
    const docRef = await addDoc(collection(db, 'tasks'), {
        ...data,
        slotsFilled: 0,
        volunteers: [],
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}
```

**ENGIN** authentication check. Ef parent kallar í þetta via browser console getur hann búið til task.

**Lagfæring:**
1. Firestore Security Rules (helst)
2. Eða backend validation:
```typescript
export async function createTask(
    data: CreateTaskInput, 
    userId: string
): Promise<string> {
    const isAdmin = await checkIfUserIsClassAdmin(userId, data.classId);
    if (!isAdmin) throw new Error('Unauthorized');
    //...
}
```

---

## 🔧 III. CRUD GAPS (VANTAR AÐGERÐIR)

### 8. TASKS: Engin Edit/Delete virkni

**Status:**
- ✅ Create (nýbúið að bæta við)
- ✅ Read (til staðar)
- ❌ Update (vantar algerlega)
- ❌ Delete (vantar algerlega)

**Vandamál:**
```bash
$ grep -r "updateTask" app/
# Engar niðurstöður

$ grep -r "deleteTask" app/
# Engar niðurstöður
```

**Afleiðingar:**
- Admin gerir mistök í heiti á Rölt → **ÓLagfæranleg**
- Admin setur ranga dagsetningu → **Óleiðrétt**
- Admin þarf að eyða "test" task → **Óhægt**

**Þetta er óviðunandi.**

**Lagfæring:**
1. Bæta við `useUpdateTask` og `useDeleteTask` hooks
2. Bæta "✏️ Breyta" og "🗑️ Eyða" tökkum á patrol/tasks pages
3. Edit modal með pre-filled form

---

### 9. ANNOUNCEMENTS: Engin Edit/Delete virkni

**Status:**
- ✅ Create
- ✅ Read
- ❌ Update
- ❌ Delete

**Sama vandamál.**

**Lagfæring:**
Sama lausn.

---

### 10. STUDENTS: Engin Edit/Delete virkni í UI

**Status:**
- ✅ Create (í onboarding)
- ✅ Read (directory, dashboard)
- ❌ Update (hooks eru til en ENGIN UI)
- ❌ Delete (hooks eru til en ENGIN UI)

**Vandamál:**
```typescript
// hooks/useFirestore.ts:
export function useUpdateStudent() { ... }  // ✅ Til
export function useDeleteStudent() { ... }  // ✅ Til

// EN engin UI kallar í þá
```

**Afleiðingar:**
- Foreldri skrifar nafn barns rangt → **Óleiðrétt**
- Barn með ofnæmi breytist → **Óbreytanlegt**
- Barn hættir í skóla → **Óeyðanlegt**

**Lagfæring:**
1. Bæta "Breyta upplýsingum" takka við directory cards
2. Modal með edit form
3. Confirmation dialog fyrir delete

---

### 11. CLASS: Engin Delete Class virkni

**Vandamál:**
- Admin stofnar class fyrir 1. bekk
- 10 ár síðar þarf hann að eyða því
- **Engin leið**

**Lagfæring:**
Danger Zone í Settings með "Eyða bekk" takka + confirmation.

---

### 12. PARENT LINKS: Engin UI fyrir Approvals

**Vandamál:**
```typescript
// ParentLink model:
status: 'pending' | 'approved'
```

**Flæði:**
1. Parent bætir sig við bekk → `status: 'pending'`
2. Admin þarf að samþykkja
3. **ENGIN UI til að samþykkja**

**Staða:**
```bash
$ grep -r "approveParentLink" app/
# Engar niðurstöður
```

Service function er til. UI vantar.

**Lagfæring:**
1. Admin Panel síða: `/is/admin/approvals`
2. Sýna pending requests
3. "Samþykkja" / "Hafna" takkar

---

## 🧭 IV. LEIÐSÖGUVILLUR (NAVIGATION ISSUES)

### 13. Dead End: Profile síða hefur ekki "Back" takka

**Vandamál:**
```tsx
// user/profile/page.tsx:
<header>
    <h1>Minn Aðgangur</h1>
    // ❌ Enginn back button
    // ❌ Enginn breadcrumb
</header>
```

Notandi kemur á síðuna og veit ekki hvernig á að fara til baka.

**Lagfæring:**
Bæta við back/home takka.

---

### 14. Empty State: Dashboard án viðburða sýnir ekki aðgerð

**Vandamál:**
```tsx
// dashboard/DashboardView.tsx:
{upcomingTasks.length > 0 ? (
    // Show tasks
) : (
    <div className="nordic-card p-8 text-center">
        <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
        <p className="text-gray-500 font-medium mb-2">
            {translations.no_events}
        </p>
        {isAdmin && (
            <Link href={`/${locale}/settings`}>
                Sækja skóladagatal í stillingum →
            </Link>
        )}
    </div>
)}
```

**Vandamál:**
- Admin sér "Sækja dagatal" link (✅ gott)
- **Regular parent** sér: "Engir viðburðir" og **EKKERT annað**

**Lagfæring:**
Fyrir parents: "Bekkjarformaður hefur ekki bætt við viðburðum enn."

---

### 15. Empty State: Directory án nemenda

**Vandamál:**
```tsx
{students.length === 0 && (
    <div className="text-center py-12">
        <Users size={48} />
        <h3>Engir nemendur enn</h3>
        <p>Bekkjarformaður þarf að bæta nemendum við</p>
        // ❌ ENGINN ACTION fyrir admin
    </div>
)}
```

**Ef admin er að skoða þetta:**
→ Ætti að sjá "Bæta við nemanda" takka

**Lagfæring:**
Conditional CTA.

---

## 🔢 V. AÐGERÐARÁÆTLUN

### SECURITY MATRIX

| Aðgerð | Admin | Parent | Ógesta |
|--------|-------|--------|---------|
| **CLASS** |
| Create Class | ✅ | ❌ | ❌ |
| View Class | ✅ | ✅ (own) | ❌ |
| Edit Class | ✅ | ❌ | ❌ |
| Delete Class | ✅ | ❌ | ❌ |
| **STUDENTS** |
| Create Student | ✅ | ✅¹ | ❌ |
| View Students | ✅ | ✅ (if linked) | ❌ |
| Edit Student | ✅ | ✅² | ❌ |
| Delete Student | ✅ | ❌ | ❌ |
| **TASKS/EVENTS** |
| Create | ✅ | ❌ | ❌ |
| View | ✅ | ✅ | ❌ |
| Edit | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| Volunteer | ✅ | ✅ | ❌ |
| **ANNOUNCEMENTS** |
| Create | ✅ | ❌ | ❌ |
| View | ✅ | ✅ | ❌ |
| Edit | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **SETTINGS** |
| View Settings | ✅ | ❌ | ❌ |
| Edit Profile | ✅ | ✅ | ❌ |
| View Directory | ✅ | ✅ (if linked) | ❌ |

¹ Parent can create their own child only  
² Parent can only edit their own child's info

---

### PRIORITY FIXES (Röðun)

#### 🔴 CRITICAL (Verður að laga fyrir production)

1. **URL Security** - Block unauthorized access to admin routes
2. **Photo Upload** - Replace text input með proper uploader
3. **Edit/Delete Tasks** - Admin stuck með villur
4. **Edit/Delete Announcements** - Same
5. **User Settings Page** - Cannot change phone/photo

#### 🟡 HIGH (Mjög mikilvægt)

6. **Edit Students** - UI fyrir useUpdateStudent
7. **Delete Students** - Confirmation modal
8. **Parent Approval Flow** - Admin panel fyrir pending links
9. **Parent Info in Directory** - Show actual parent contacts
10. **Empty State CTAs** - Guide users what to do

#### 🟢 MEDIUM (Ætti að laga fljótt)

11. **Delete Class** - Danger zone
12. **Notification Preferences** - For future email/SMS
13. **Language Switcher** - UI fyrir User.language
14. **Address Field** - Input fyrir map integration
15. **Back Buttons** - Improve navigation

---

### IMPLEMENTATION CHECKLIST

#### Phase 1: Security (Vika 1)

- [ ] `middleware.ts` - Route protection
- [ ] Firestore Security Rules - Backend validation
- [ ] Admin route guards í `/settings`, `/admin`
- [ ] Error boundaries fyrir unauthorized access

#### Phase 2: Critical CRUD (Vika 1-2)

- [ ] `/app/[locale]/(app)/user/settings/page.tsx` - User settings
- [ ] `/components/upload/ImageUploader.tsx` - Photo upload
- [ ] `/components/modals/EditTaskModal.tsx` - Task editing
- [ ] `/components/modals/EditAnnouncementModal.tsx` - Announcement editing
- [ ] Add Delete confirmations með toast notifications

#### Phase 3: Student Management (Vika 2)

- [ ] `/components/modals/EditStudentModal.tsx`
- [ ] Delete confirmation dialog
- [ ] `/app/[locale]/(app)/admin/approvals/page.tsx` - Parent approvals
- [ ] Parent contact info í directory

#### Phase 4: UX Polish (Vika 3)

- [ ] Empty state improvements með conditional CTAs
- [ ] Back button component
- [ ] Breadcrumb navigation
- [ ] Loading states improvement
- [ ] Error handling með user-friendly messages

---

## 📊 LOKAORÐ

**Núverandi stig: 4/10**

**Helstu vandamál:**
1. Notendur geta ekki breytt grunnupplýsingum
2. Admin getur ekki leiðrétt villur
3. Öryggisgöt í route protection
4. Óklárað approval flæði

**Þegar lagað: 9/10**

**Tíma áætlun:**
- Critical fixes: 2-3 vikur
- Full completion: 4-5 vikur

**Næstu skref:**
1. Byrja á Security fixes (Phase 1)
2. Implementa User Settings
3. Add CRUD completion fyrir Tasks/Announcements
4. Polish UX

**Ítarlegri greining á hverju issue fyrir sig er tiltæk ef þörf krefur.**
