# Project Structure

```
CyberLearn/
├── index.html                    # HTML entry point with SEO meta tags
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config with custom design system
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.app.json             # App-specific TS config
├── tsconfig.node.json            # Node-specific TS config
├── eslint.config.js              # ESLint configuration
├── .env                          # Environment variables (Supabase credentials)
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── CHANGELOG.md                  # Version history
├── BUG_REPORT.md                 # Bug audit report
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Main app with routing logic
│   ├── index.css                 # Global styles and design system
│   ├── vite-env.d.ts             # Vite type declarations
│   ├── lib/
│   │   └── supabase.ts           # Supabase client + TypeScript interfaces
│   ├── context/
│   │   └── AuthContext.tsx       # Auth provider with RBAC
│   ├── router/
│   │   └── Router.tsx            # Hash-based router + Link component
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation with auth state + notifications
│   │   └── Footer.tsx            # Site footer
│   └── pages/
│       ├── LandingPage.tsx       # Homepage with hero, features, courses
│       ├── SignInPage.tsx        # Sign in form
│       ├── SignUpPage.tsx        # Sign up form with password validation
│       ├── CoursesPage.tsx       # Course catalog with filters
│       ├── CourseDetailPage.tsx  # Course detail with lessons + progress
│       ├── DashboardPage.tsx     # Student dashboard with stats
│       ├── AchievementsPage.tsx  # Badge gallery
│       ├── CertificatesPage.tsx  # Certificate display
│       ├── ForumPage.tsx         # Forum home, category, topic view
│       ├── NewTopicPage.tsx      # Create new forum topic
│       ├── NotesPage.tsx         # Personal notes CRUD
│       ├── ProfilePage.tsx       # Profile settings
│       └── AdminPage.tsx         # Admin panel (courses, users)
└── supabase/
    └── functions/                # Edge functions directory (for future use)
```

## Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite 5** for fast development and optimized builds
- **Tailwind CSS 3** with custom design system (6 color ramps, animations)
- **Lucide React** for icons
- **Hash-based routing** (no external router dependency)

### Backend
- **Supabase** for database, authentication, and edge functions
- **PostgreSQL** with Row Level Security on all tables
- **Supabase Auth** with email/password authentication
- **Database triggers** for auto profile creation and updated_at

### Security
- RLS policies on all 15 tables
- Role-based access control (student, instructor, admin)
- Protected routes with automatic redirect
- Input validation on all forms
- Owner-scoped CRUD operations
