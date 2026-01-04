# 🌍 Babelfish Feature - Auto-Translation for Announcements

## Concept

When parents speak different languages (Icelandic, Polish, Spanish, English), they need to understand announcements and messages from each other. **Babelfish** auto-translates user-generated content into each parent's preferred language.

---

## Use Cases

### Scenario 1: Mixed-Language Class
- **Anna (Icelandic)** posts: "Næsti foreldrafundur er 15. janúar kl. 19:00"
- **Magda (Polish)** sees: "Następne spotkanie rodziców 15 stycznia o 19:00" + badge: *"Translated from Icelandic"*
- **Carlos (Spanish)** sees: "Próxima reunión de padres 15 de enero a las 19:00" + badge: *"Traducido del islandés"*

### Scenario 2: Task Instructions
- **Admin (Icelandic)** creates task: "Baka kökur fyrir jólahátíð"
- **All parents** see it in their language:
  - 🇵🇱 "Upiec ciastka na świąteczną imprezę"
  - 🇪🇸 "Hornear galletas para la fiesta navideña"
  - 🇬🇧 "Bake cookies for Christmas party"

---

## Technical Approach

### Option 1: Google Cloud Translation API
**Pros:**
- Already integrated with Firebase/Google Cloud
- Supports 100+ languages
- High quality translations
- Pay-per-character (cheap for announcements)

**Cons:**
- Costs money (but minimal for this use case)
- Requires API key management

### Option 2: LibreTranslate (Self-hosted/API)
**Pros:**
- Open source
- Can self-host or use their API
- Privacy-friendly

**Cons:**
- Lower quality than Google
- Self-hosting requires infrastructure

### **Recommended: Google Cloud Translation API**

---

## Data Schema

### Store Original + Language

```typescript
interface Announcement {
  id: string;
  classId: string;
  title: string;              // Original title
  content: string;            // Original content
  originalLanguage: 'is' | 'en' | 'pl' | 'es';  // Author's language
  createdBy: string;
  author: string;
  pinned: boolean;
  createdAt: Timestamp;
  
  // Translation cache (to avoid repeated API calls)
  translations?: {
    [lang: string]: {
      title: string;
      content: string;
      translatedAt: Timestamp;
    };
  };
}
```

### Translation Flow

```typescript
async function getAnnouncementInLanguage(
  announcement: Announcement,
  targetLanguage: string
): Promise<{ title: string; content: string; isTranslated: boolean }> {
  
  // If viewing in original language, return as-is
  if (announcement.originalLanguage === targetLanguage) {
    return {
      title: announcement.title,
      content: announcement.content,
      isTranslated: false,
    };
  }
  
  // Check cache first
  if (announcement.translations?.[targetLanguage]) {
    return {
      ...announcement.translations[targetLanguage],
      isTranslated: true,
    };
  }
  
  // Translate via API
  const translated = await translateText(
    [announcement.title, announcement.content],
    announcement.originalLanguage,
    targetLanguage
  );
  
  // Cache the translation in Firestore
  await updateDoc(doc(db, 'announcements', announcement.id), {
    [`translations.${targetLanguage}`]: {
      title: translated[0],
      content: translated[1],
      translatedAt: serverTimestamp(),
    },
  });
  
  return {
    title: translated[0],
    content: translated[1],
    isTranslated: true,
  };
}
```

---

## UI/UX Design (Simplified Approach)

### Always Show Original + Translation Below

**Original message stays visible at top**
```
┌─────────────────────────────────────┐
│ Anna Jónsdóttir (Formaður)          │
│ Næsti foreldrafundur er 15. janúar  │
│ kl. 19:00 í matsalnum.              │
│                                     │
│ ─────────────────────────────────── │
│ 🌍 Machine Translation (Polish):    │
│ Następne spotkanie rodziców         │
│ 15 stycznia o 19:00 w stołówce.     │
└─────────────────────────────────────┘
```

**Disclaimer appears globally** (once per page, not per message):
```
┌─────────────────────────────────────┐
│ ℹ️ All messages are automatically   │
│ translated. Translations may not be │
│ perfect - when in doubt, ask the    │
│ author to clarify.                  │
└─────────────────────────────────────┘
```

### Benefits of This Approach

✅ **Transparency** - Both versions always visible
✅ **Trust** - Parents can verify if they know multiple languages
✅ **Simpler** - No "toggle" buttons or hidden content
✅ **Educational** - Helps parents learn phrases in other languages
✅ **Legal safety** - Original text is always preserved

### Code Example

```tsx
<div className="nordic-card p-5 space-y-3">
  {/* Original Message */}
  <div>
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-white">
        A
      </div>
      <div>
        <p className="font-medium text-sm">Anna Jónsdóttir</p>
        <p className="text-xs text-tertiary">2 hours ago</p>
      </div>
    </div>
    <p className="text-sm">{announcement.content}</p>
  </div>

  {/* Translation (if user language differs) */}
  {userLanguage !== announcement.originalLanguage && (
    <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
      <div className="flex items-center gap-1 text-xs mb-2" 
           style={{ color: 'var(--text-tertiary)' }}>
        <Languages size={12} />
        <span>Machine Translation ({languageNames[userLanguage]})</span>
      </div>
      <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
        {translatedContent}
      </p>
    </div>
  )}
</div>
```

### Global Disclaimer Component

```tsx
// components/TranslationDisclaimer.tsx
export function TranslationDisclaimer() {
  return (
    <div className="nordic-card p-4 mb-4" 
         style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--border-light)' }}>
      <div className="flex items-start gap-3">
        <Info size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <strong>Translation Notice:</strong> Messages are automatically translated 
          to your language. Translations may not be perfect. When in doubt, 
          ask the author to clarify.
        </div>
      </div>
    </div>
  );
}
```

---

## Data Schema (Simplified)

No need to cache translations in Firestore! Just translate on-demand:

```typescript
interface Announcement {
  id: string;
  classId: string;
  title: string;              // Original only
  content: string;            // Original only
  originalLanguage: 'is' | 'en' | 'pl' | 'es';
  createdBy: string;
  author: string;
  pinned: boolean;
  createdAt: Timestamp;
}
```

Translation happens client-side via API route:

```typescript
// app/api/translate/route.ts
export async function POST(request: Request) {
  const { text, sourceLang, targetLang } = await request.json();
  
  const translated = await translateText(text, sourceLang, targetLang);
  
  return Response.json({ translated });
}
```

---

## Implementation (Ultra-Simple)

### 1. Translation Hook

```typescript
// hooks/useTranslation.ts
export function useTranslation(
  text: string,
  sourceLang: string,
  targetLang: string
) {
  return useQuery({
    queryKey: ['translation', text, sourceLang, targetLang],
    queryFn: async () => {
      if (sourceLang === targetLang) return text;
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });
      
      const data = await response.json();
      return data.translated;
    },
    staleTime: Infinity, // Translations don't change
  });
}
```

### 2. Use in Component

```typescript
const userLanguage = 'pl'; // from user context
const { data: translatedContent } = useTranslation(
  announcement.content,
  announcement.originalLanguage,
  userLanguage
);

// Render both original + translation
```

---

## Cost (Even Cheaper!)

No caching in Firestore = simpler code
But client-side caching in React Query = same benefit

**Cost per announcement:**
- Only translate when viewed by user with different language
- React Query caches forever (staleTime: Infinity)
- Still ~$0.012 per announcement, but only when needed

---

## Privacy & Legal

### Disclaimer Text (All Languages)

**English:**
> Translation Notice: Messages are automatically translated to yourlanguage. Translations may not be perfect. When in doubt, ask the author to clarify.

**Icelandic:**
> Þýðingarupplýsingar: Skilaboð eru sjálfvirkt þýdd á tungumálið þitt. Þýðingar kunna að vera ófullkomnar. Ef vafi leikur á, biddu höfundinn að skýra.

**Polish:**
> Uwaga dotycząca tłumaczenia: Wiadomości są automatycznie tłumaczone na Twój język. Tłumaczenia mogą nie być idealne. W razie wątpliwości poproś autora o wyjaśnienie.

**Spanish:**
> Aviso de traducción: Los mensajes se traducen automáticamente a tu idioma. Las traducciones pueden no ser perfectas. En caso de duda, pide al autor que aclare.

---

## What This Enables

1. **Icelandic parent** posts patrol reminder
2. **Polish parent** sees:
   - ✅ Original Icelandic text (can copy/paste to Google if needed)
   - ✅ Polish translation below
   - ✅ Knows it's machine-translated (disclaimer)
3. **Spanish parent** sees same structure in Spanish
4. **Everyone** can verify by comparing translations if they know multiple languages

**Result:** True inclusion without replacing or hiding original content! 🌍

---

*This is the pragmatic, transparent approach that respects both the original author and readers in other languages.*

---

## Implementation Steps

### Phase 1: Setup (1-2 hours)
1. Enable Google Cloud Translation API in Firebase project
2. Create service account with Translation API permissions
3. Install `@google-cloud/translate` package
4. Create translation service (`services/translation.ts`)

### Phase 2: Announcements (2-3 hours)
5. Update `Announcement` schema with `originalLanguage` and `translations`
6. Modify `useAnnouncements` hook to auto-translate
7. Add translation badge to UI
8. Test with all 4 languages

### Phase 3: Tasks & Other Content (2-3 hours)
9. Apply same pattern to `Task` descriptions
10. Handle parent names (optional - might keep original)
11. Add language preference to user profile

### Phase 4: Optimization (1-2 hours)
12. Cache translations in Firestore (done in step 6)
13. Batch translate multiple items at once
14. Add retry logic for failed translations

---

## Cost Estimation

### Google Cloud Translation API Pricing
- **$20 per 1 million characters**
- Average announcement: ~200 characters
- Translations per announcement: 3 (to other languages)
- Cost per announcement: ~$0.012 (1.2 cents)

**For a class of 30 parents:**
- 50 announcements/year
- 3 translations each
- Total: ~$0.60/year per class

**Essentially free for this use case!**

---

## Privacy Considerations

1. **Transparency**: Always show a badge when content is translated
2. **Original Always Available**: Users can view the original text
3. **No PII in Translations**: Parent names, phone numbers are NOT translated
4. **Caching**: Translations are cached to avoid repeated API calls

---

## Future Enhancements

### Real-time Chat Translation
- Extend to a future chat feature
- Translate messages as they arrive
- Support emoji and inline images

### Voice-to-Text + Translation
- Parents record voice messages
- Transcribe to text (Google Speech-to-Text)
- Translate to other languages
- Very helpful for parents with low literacy

### Document Translation
- Upload PDFs (school forms, etc.)
- Auto-translate entire documents
- Could use Google Cloud Document AI

---

## Example Code

### Translation Service

```typescript
// services/translation.ts
import { TranslationServiceClient } from '@google-cloud/translate';

const translationClient = new TranslationServiceClient();

export async function translateText(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<string[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const location = 'global';

  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: texts,
    mimeType: 'text/plain',
    sourceLanguageCode: sourceLanguage,
    targetLanguageCode: targetLanguage,
  };

  const [response] = await translationClient.translateText(request);
  return response.translations?.map(t => t.translatedText || '') || [];
}
```

### React Hook

```typescript
// hooks/useTranslatedAnnouncements.ts
export function useTranslatedAnnouncements(classId: string) {
  const userLanguage = useUserLanguage(); // from context
  const { data: announcements } = useAnnouncements(classId);
  
  const [translatedAnnouncements, setTranslatedAnnouncements] = useState([]);

  useEffect(() => {
    if (!announcements) return;
    
    const translate = async () => {
      const results = await Promise.all(
        announcements.map(a => getAnnouncementInLanguage(a, userLanguage))
      );
      setTranslatedAnnouncements(results);
    };
    
    translate();
  }, [announcements, userLanguage]);

  return translatedAnnouncements;
}
```

---

## Next Steps

1. **Document this feature** ✅ (this file)
2. **Add to roadmap** in `PROJECT_STATUS.md`
3. **Enable API** when ready to implement
4. **Budget approval** (though cost is negligible)
5. **Test with real multilingual parents**

---

**This feature will make Bekkurinn truly inclusive for Iceland's diverse immigrant communities!** 🌍
