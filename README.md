# Bekkurinn - The Class Representative OS

**Status:** ✅ Fully Functional Demo  
**Version:** 0.2.0  
**Framework:** Next.js 14+ (App Router)  
**Language:** TypeScript (Strict Mode)

---

## 📋 Project Overview

**Bekkurinn** (The Class) is a comprehensive class representative management system for Icelandic elementary schools. It replaces chaotic Facebook Groups with a structured, privacy-first tool for managing class activities, birthdays, events, and parent coordination.

### Core Features

- 📚 **Directory (Skrá):** Child-focused contact list with starring & dietary info
- 🗓️ **Calendar (Dagatal):** Birthdays, activities, and parent patrols
- 📋 **Organization (Skipulag):** Event coordination and task management
- 📢 **Notice Board (Auglýsingataflan):** Announcements from class representatives

### Design Principles

- **Privacy-First:** GDPR-compliant with explicit consent for all data
- **Mobile-First:** 44px+ tap targets, thumb-optimized navigation
- **Nordic Minimalism:** Calming, professional, trustworthy aesthetic
- **Icelandic-First:** Full UI in Icelandic with realistic local data
- **Dietary Awareness:** Clear allergy indicators for safe event planning

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | **Next.js 14+** (App Router) | React framework with Server Components |
| Language | **TypeScript** (Strict Mode) | Type safety |
| Styling | **Tailwind CSS v4** + Custom CSS | Utility-first with Nordic design tokens |
| Icons | **Lucide React** | Professional icon set |
| Backend | **Firebase v9** | Auth, Firestore, Storage (planned) |
| State Management | **React Hooks** (useState) | Client-side state |
| i18n | **next-intl** | Icelandic (default), English, Polish, Spanish |

---

## 🎨 Nordic Trust Design System

### Color Palette

```css
--sage-green: #3d7a5d;      /* Primary brand color */
--sage-dark: #2d5a44;       /* Hover states */
--stone: #f5f5f4;           /* Background accents */
--paper: #fafaf9;           /* Card backgrounds */
--white: #ffffff;           /* Pure white */
--amber: #f59e0b;           /* Birthdays, warnings, pins */
--amber-dark: #d97706;      /* Darker amber */
--green-success: #10b981;   /* Success states */
```

### Components

- `.nordic-card` - Rounded cards with subtle borders
- `.nordic-button` - Sage green primary buttons
- `.tap-target` - 44px minimum for mobile taps

---

## 🔥 Current Features (Demo Data)

### 1. **Directory (Skrá)** ✅
- **15 Students** with realistic Icelandic names
- **30 Parents** (2 per child) with contacts
- **Starring System** - Mark friends, sort to top
- **Expandable Cards** - Click child to reveal parent info
- **Photo Placeholders** - Initials until photos uploaded
- **Search** - Filter by student name
- **Dietary Badges** - 5 types (peanut, gluten, dairy, vegan, pork)
- **Responsive Grid** - 1/2/3 columns (mobile/tablet/desktop)

### 2. **Calendar (Dagatal)** ✅
- **This Month's Birthdays** - Highlighted with amber border
- **Upcoming Birthdays** - Expandable Feb/Mar sections
- **Class Activities** - Parent meetings, ski trips, sports day
- **Parent Patrols** - Next 2 months, volunteer tracking
- **All Collapsible** - Clean, scannable view

### 3. **Organization (Skipulag)** ✅
- **Birthday Party Events** - Example: Ari's 10th with 8 kids
- **Dietary Summary** - Icons + labels for hosts
- **Multi-Slot Tasks** - Bake cakes 1/3, decorate 2/2
- **Gift Collections** - Progress bars for fundraising
- **Volunteer Sign-ups** - "Bjóðast" buttons

### 4. **Notice Board (Auglýsingataflan)** ✅
- **6 Realistic Announcements** - Parent meetings, ski trips, etc.
- **Pinned Posts** - Amber border highlight
- **Author Info** - Roles (Formaður, Viðburðastjóri)
- **Like Counts** - Engagement indicators
- **Rich Content** - Multi-line formatted text

### 5. **Navigation**  ✅
- **Top Header** - Logo, notification bell (with badge), settings
- **Bottom Nav** - 4 tabs with Icelandic labels
- **Fixed Positioning** - Always accessible

---

## 📂 Project Structure

```
bekkurinn/
├── app/
│   ├── [locale]/
│   │   ├── (app)/
│   │   │   ├── directory/page.tsx    # Child-focused directory
│   │   │   ├── patrol/page.tsx       # Calendar with birthdays
│   │   │   ├── tasks/page.tsx        # Organization/events
│   │   │   ├── announcements/page.tsx # Notice board
│   │   │   └── layout.tsx            # App layout (header + nav)
│   │   └── page.tsx                  # Landing (to be built)
│   ├── globals.css                   # Nordic design tokens
│   └── layout.tsx                    # Root layout
├── components/
│   ├── navigation/
│   │   ├── TopHeader.tsx             # Logo, notifications, settings
│   │   └── BottomNav.tsx             # 4-tab mobile nav
│   └── icons/
│       └── DietaryIcons.tsx          # Dietary badges with labels
├── messages/
│   ├── is.json                       # Icelandic (primary)
│   ├── en.json                       # English
│   ├── pl.json                       # Polish
│   └── es.json                       # Spanish
├── public/
│   └── logo.png                      # Custom Bekkurinn logo
├── types/
│   └── index.ts                      # TypeScript definitions
└── scripts/
    └── seedDatabase.ts               # Firestore seeding (has errors)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd bekkurinn

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000/is/directory
```

### Current Demo

Navigate to `http://localhost:3000/is/directory` to see the full system with:
- 15 students
- 30 parents
- 8 patrols
- 6 announcements
- Birthday party with dietary info
- All features interactive

---

## 🎯 Roadmap

### ✅ Completed (v0.2.0)
- [x] Full Icelandic translation
- [x] Nordic design system
- [x] Starring/favoriting system
- [x] Expandable child cards
- [x] Dietary icons with labels
- [x] Calendar with birthdays
- [x] Collapsible sections
- [x] Responsive layouts (desktop ready)
- [x] Top header with notifications
- [x] Mock data integration

### 🚧 Next Up (v0.3.0)
- [ ] Firebase authentication
- [ ] Connect UI to Firestore
- [ ] Photo upload for students/parents
- [ ] Admin vs parent permissions
- [ ] Real-time updates
- [ ] Push notifications

### 📅 Future (v0.4.0+)
- [ ] Email digest system
- [ ] Export functionality (PDF, Excel)
- [ ] Multiple classes per school
- [ ] Teacher portal
- [ ] Analytics dashboard

---

## 🔐 Privacy & Compliance

### Data Protection
- **Explicit Consent:** Admins must agree to confidentiality
- **GDPR Flags:** Photo permission, phone visibility toggles
- **No Money:** System cannot process payments (by design)
- **Parent Control:** Dietary info, contacts controlled by parents

### Security (Planned)
- Firebase Security Rules for role-based access
- Server-side validation
- Audit logs for admin actions

---

## 🌍 Internationalization

Currently supports 4 languages via `next-intl`:
- **Icelandic (is)** - Primary, all UI translated
- **English (en)** - For international families
- **Polish (pl)** - Large immigrant community
- **Spanish (es)** - Growing community

Translation files in `messages/` directory.

---

## 📱 Mobile-First Design

All UI follows these principles:
1. **44px+ tap targets** - Thumb-friendly buttons
2. **Safe area support** - Works with mobile notches
3. **Bottom navigation** - Primary nav in thumb zone
4. **Responsive grids** - Adapts to screen size
5. **Fixed header** - Always accessible navigation

---

## 🎨 UI/UX Highlights

### Directory
- Click child card to expand/collapse parent info
- Star icon to mark friends (sorts to top)
- Dietary icons with Icelandic labels
- Search bar filters in real-time

### Calendar
- Current month birthdays highlighted
- All sections collapsible for clean view
- Patrols show volunteer status
- "Þú" (You) highlighted in green

### Organization
- Event cards show dietary summary
- Multi-slot tasks track volunteers
- Progress bars for gift collections
- Clear "Bjóðast" (volunteer) buttons

### Notice Board
- Pinned announcements with amber border
- Author roles displayed
- Like counts for engagement
- Chronological feed

---

## 🐛 Known Issues

1. **Firebase Seeding** - Script has `3 INVALID_ARGUMENT` errors
2. **Mock Data** - Embedded in components (should use context)
3. **No Loading States** - All instant, no spinners yet
4. **No Error Handling** - No error boundaries
5. **No Offline Support** - Requires internet connection

---

## 🤝 Contributing

When contributing, please:
1. Follow the Nordic Trust design system
2. Maintain TypeScript strict mode
3. Use mobile-first approach
4. Keep UI calming, not addictive
5. Never add money-processing features

---

## 📄 License

TBD

---

## 📞 Contact

For questions about architecture or design, see `PROJECT_STATUS.md`.

---

**Built with ❤️ for Icelandic classrooms**
