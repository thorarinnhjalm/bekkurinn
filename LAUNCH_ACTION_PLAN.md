# 🚀 VERKÁÆTLUN: MARKAÐSSETNING BEKKJARINS
## Launch-ready: 25. janúar 2026

**Núverandi staða:** 85% tilbúið  
**Tímaáætlun:** 2 vikur intensive vinnu  
**Markmið:** 100% production-ready kerfi með 11/10 upplifun

---

## 📋 FORGANGSRÖÐUN

### 🔴 CRITICAL — Verður að gera fyrir launch (Vika 1)
**Tími:** ~20 klst  
**Deadline:** 14. janúar

| # | Verkefni | Tími | Status |
|---|----------|------|--------|
| 1 | Laga SSRF í proxy-calendar | 30 mín | ⏳ |
| 2 | Fjarlægja console.log úr production | 15 mín | ⏳ |
| 3 | Breyta Super Admin í Custom Claims | 1 klst | ⏳ |
| 4 | Bæta við Rate Limiting á API | 2 klst | ⏳ |
| 5 | Input validation með Zod | 2 klst | ⏳ |
| 6 | Búa til Landing Page | 4 klst | ⏳ |
| 7 | Deploy Firestore Indexes | 30 mín | ⏳ |
| 8 | Error Boundary Components | 1.5 klst | ⏳ |
| 9 | Toast Notification System | 2 klst | ⏳ |
| 10 | Production build test | 1 klst | ⏳ |

---

### 🟡 HIGH PRIORITY — Fyrir betri UX (Vika 2)
**Tími:** ~20 klst  
**Deadline:** 21. janúar

| # | Verkefni | Tími | Status |
|---|----------|------|--------|
| 11 | Skeleton Loading States | 3 klst | ⏳ |
| 12 | QR Code fyrir Join Codes | 2 klst | ⏳ |
| 13 | Undo functionality | 4 klst | ⏳ |
| 14 | Cascade Deletes Cloud Function | 2 klst | ⏳ |
| 15 | Empty States með CTA | 3 klst | ⏳ |
| 16 | Hover animations á cards | 1 klst | ⏳ |
| 17 | Success state animations | 2 klst | ⏳ |
| 18 | Welcome Modal | 1.5 klst | ⏳ |
| 19 | Texti og copy endurskoðun | 1.5 klst | ⏳ |

---

### 🟢 NICE TO HAVE — Eftir launch
**Tími:** Ongoing  
**Deadline:** Febrúar

| # | Verkefni | Tími | Status |
|---|----------|------|--------|
| 20 | Push Notifications | 1 vika | 📋 |
| 21 | Photo Gallery | 2 vikur | 📋 |
| 22 | Gamification System | 1 vika | 📋 |
| 23 | Export PDF Reports | 3 dagar | 📋 |
| 24 | Multi-language support | 1 vika | 📋 |

---

## 📝 ÍTARLEGAR LEIÐBEININGAR

### 🔴 CRITICAL VERKEFNI

#### **1. Laga SSRF í proxy-calendar** (30 mín)
**Skrár:** `/app/api/proxy-calendar/route.ts`

**Action items:**
- [ ] Búa til whitelist af leyfilegum domains
- [ ] Validate URL format og protocol
- [ ] Bæta við timeout (5 sek)
- [ ] Disable redirects
- [ ] Test með mismunandi URLs

**Kóði:**
```typescript
const ALLOWED_DOMAINS = [
    'www.reykjavik.is',
    'kopavogur.is', 
    'gardabaer.is',
    'mosfellsbaer.is',
    'seltjarnarnes.is'
];

// ... validation logic (sjá skýrslu)
```

---

#### **2. Fjarlægja console.log** (15 mín)
**Skrár:** 
- `/lib/firebase/config.ts`
- `/app/[locale]/onboarding/OnboardingView.tsx`

**Action items:**
- [ ] Search codebase fyrir `console.log`
- [ ] Skipta út fyrir conditional logging
- [ ] Búa til `logger.ts` utility

**Kóði:**
```typescript
// lib/logger.ts
export const logger = {
    info: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[INFO]', ...args);
        }
    },
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
    }
};
```

---

#### **3. Super Admin Custom Claims** (1 klst)
**Skrár:** 
- `firestore.rules`
- Nýtt: `/scripts/make-super-admin.ts`

**Action items:**
- [ ] Breyta `isSuperAdmin()` í rules
- [ ] Búa til Cloud Function fyrir role assignment
- [ ] Keyra fyrir þitt user account
- [ ] Test access levels

**Cloud Function:**
```typescript
// functions/src/admin.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const setSuperAdmin = functions.https.onCall(async (data, context) => {
    // Only existing super admins can create new ones
    if (!context.auth?.token.role === 'super_admin') {
        throw new functions.https.HttpsError('permission-denied', 'Unauthorized');
    }
    
    await admin.auth().setCustomUserClaims(data.uid, {
        role: 'super_admin'
    });
    
    return { success: true };
});
```

---

#### **4. Rate Limiting** (2 klst)
**Skrár:** 
- Nýtt: `/middleware.ts` (uppfæra)
- Nýtt: `/lib/rate-limit.ts`

**Action items:**
- [ ] Innleiða rate limiter með Upstash Redis (eða in-memory)
- [ ] Nota á `/api/proxy-calendar`
- [ ] 10 requests per minute per IP
- [ ] Return 429 ef yfir limit

**Kóði:**
```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const ratelimit = new LRUCache({
    max: 500,
    ttl: 60000, // 1 minute
});

export async function rateLimiter(identifier: string, limit = 10) {
    const count = (ratelimit.get(identifier) as number) || 0;
    
    if (count >= limit) {
        return { success: false };
    }
    
    ratelimit.set(identifier, count + 1);
    return { success: true };
}
```

---

#### **5. Input Validation með Zod** (2 klst)
**Skrár:** 
- Nýtt: `/lib/validation.ts`
- `/app/[locale]/onboarding/OnboardingView.tsx`
- `/app/[locale]/(app)/settings/SettingsView.tsx`

**Action items:**
- [ ] Búa til Zod schemas fyrir öll form
- [ ] Validate á client-side
- [ ] Display friendly error messages

**Schemas:**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const OnboardingSchema = z.object({
    schoolName: z.string().min(3, 'Skólanafn verður að vera a.m.k. 3 stafir'),
    grade: z.number().int().min(1).max(10),
    section: z.string().max(50).optional(),
    isSplit: z.boolean()
});

export const JoinCodeSchema = z.string()
    .min(4, 'Boðskóði of stuttur')
    .max(20, 'Boðskóði of langur')
    .regex(/^[A-Z0-9-]+$/, 'Boðskóði má bara innihalda stóra stafi, tölur og bandstrik');
```

---

#### **6. Landing Page** (4 klst)
**Skrár:** 
- `/app/[locale]/page.tsx` (endurskrifa)
- Nýtt: `/app/[locale]/demo/page.tsx`

**Action items:**
- [ ] Hero section með value prop
- [ ] 3 features showcase
- [ ] Social proof (notendatalningar)
- [ ] FAQ section
- [ ] Footer með links

**Efnisatriði:**
```markdown
## Hero
"Umsjónarkerfi bekkjarins — einfaldað"
→ CTA: "Byrja frítt" | "Sjá sýnishorn"

## Features
1. 📅 Dagatal & Viðburðir
2. 👥 Foreldrasamtöl
3. 🎯 Rölt skipulag

## Social Proof
"47 bekkir, 200+ foreldrar"

## FAQ
- Er þetta frítt?
- Hvernig byrja ég?
- Er þetta öruggt?
```

---

#### **7. Deploy Firestore Indexes** (30 mín)
**Skrár:** `firestore.indexes.json` (already exists)

**Action items:**
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login: `firebase login`
- [ ] Deploy: `firebase deploy --only firestore:indexes`
- [ ] Wait for build (~5 mín)
- [ ] Test queries

---

#### **8. Error Boundary Components** (1.5 klst)
**Skrár:** 
- Nýtt: `/components/ErrorBoundary.tsx`
- `/app/[locale]/layout.tsx`

**Action items:**
- [ ] Wrap app í error boundary
- [ ] Fallback UI með "Reyndu aftur"
- [ ] Log errors til console (eða Sentry)

**Kóði:**
```tsx
// components/ErrorBoundary.tsx
'use client';

import React from 'react';

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Úps! Eitthvað fór úrskeiðis</h1>
                        <button 
                            onClick={() => this.setState({ hasError: false })}
                            className="bg-nordic-blue text-white px-6 py-3 rounded-lg"
                        >
                            Reyndu aftur
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
```

---

#### **9. Toast Notification System** (2 klst)
**Skrár:** 
- Nýtt: `/components/ui/Toast.tsx`
- Nýtt: `/lib/toast.ts`
- `/app/[locale]/layout.tsx`

**Action items:**
- [ ] Búa til Toast component
- [ ] Global toast provider
- [ ] Helper functions: `toast.success()`, `toast.error()`

**Útfærsla:**
```tsx
// lib/toast.ts
import { create } from 'zustand';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type: Toast['type']) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type) => {
        const id = Math.random().toString(36);
        set((state) => ({
            toasts: [...state.toasts, { id, message, type }]
        }));
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id)
            }));
        }, 3000);
    },
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    }))
}));

export const toast = {
    success: (msg: string) => useToastStore.getState().addToast(msg, 'success'),
    error: (msg: string) => useToastStore.getState().addToast(msg, 'error'),
    info: (msg: string) => useToastStore.getState().addToast(msg, 'info'),
};
```

---

#### **10. Production Build Test** (1 klst)
**Action items:**
- [ ] `npm run build`
- [ ] Laga allar TypeScript villur
- [ ] Test í production mode: `npm start`
- [ ] Test öll user flows
- [ ] Confirm no console errors

---

### 🟡 HIGH PRIORITY VERKEFNI

*(Ítarlegar leiðbeiningar fyrir verkefni 11-19 fylgja í sérstakri skjali ef þörf krefur)*

**Quick summary:**
- **#11 Skeleton States:** Replace spinners með skeleton screens
- **#12 QR Codes:** `npm install qrcode` og generate fyrir join codes
- **#13 Undo:** Toast með 5 sek cancel window
- **#14 Cascade Delete:** Cloud Function við class deletion
- **#15 Empty States:** "Engir nemendur" → CTA til að bæta við
- **#16-17 Animations:** CSS transitions og keyframes
- **#18 Welcome Modal:** First-time user onboarding
- **#19 Copy Review:** Fara yfir allan texta og gera vinalegri

---

## 📊 PROGRESS TRACKING

**Dagleg standup (9:00):**
- Hvað gerðir þú í gær?
- Hvað ætlar þú að gera í dag?
- Eru einhverjar hindranir?

**Weekly review (Föstudagar):**
- Hvað kláraðist?
- Hvað er eftir?
- Þurfum við að breyta forgangi?

---

## ✅ DEFINITION OF DONE

Hver verkefni telst "Done" þegar:
- [ ] Kóði er skrifaður og testað
- [ ] TypeScript errors = 0
- [ ] Engar console warnings í production
- [ ] Peer review frá öðrum (ef mögulegt)
- [ ] Committed og pushed til Git
- [ ] Deployed til staging/production
- [ ] User test (manual)

---

## 🎯 LAUNCH CHECKLIST (25. janúar)

**T-minus 1 dagur:**
- [ ] Allir CRITICAL verkefni done
- [ ] 80%+ af HIGH PRIORITY done
- [ ] Full regression test
- [ ] Performance test (Lighthouse score >90)
- [ ] Security scan
- [ ] Backup af database

**Launch dagur:**
- [ ] Deploy til production
- [ ] Monitor error logs í 2 klst
- [ ] Soft launch: Senda invite til 5 beta users
- [ ] Collect feedback
- [ ] Hotfix ef þörf

**T-plus 1 vika:**
- [ ] Public announcement
- [ ] Marketing push
- [ ] Monitor metrics (sign-ups, engagement)

---

## 🆘 ESCALATION PLAN

**Ef eitthvað fer úrskeiðis:**

1. **Critical Bug í Production:**
   - Rollback strax til síðustu stable version
   - Debug í staging
   - Deploy fix innan 2 klst

2. **Öryggisbrestur:**
   - Taka kerfi offline STRAX
   - Notify notendur innan 24 klst
   - Fix og deploy innan 48 klst

3. **Performance Issues:**
   - Enable caching
   - Scale up Firebase plan
   - Optimize queries

---

## 📞 TENGILIÐIR

**Technical Issues:**  
Þórarinn Hjalmarsson - thorarinn@antigravity.is

**Firebase Support:**  
https://firebase.google.com/support

**Emergency Downtime:**  
Vercel Status: https://www.vercel-status.com/

---

**Síðast uppfært:** 7. janúar 2026  
**Næsta review:** 14. janúar 2026

🚀 **Gangi vel!**
