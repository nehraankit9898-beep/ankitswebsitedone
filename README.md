# CyberLearn - Cybersecurity Learning Platform

A production-ready cybersecurity learning platform built with React, TypeScript, Vite, and Supabase.

## Features

- **Course Management**: Browse and enroll in cybersecurity courses across 6 categories
- **Interactive Lessons**: Module-based lessons with progress tracking
- **Achievement System**: Earn badges and points as you learn
- **Certificates**: Automatic certificate generation upon course completion
- **Community Forum**: Discuss topics, ask questions, and share knowledge
- **Personal Notes**: Take and manage study notes
- **Notifications**: In-app notification system
- **Role-Based Access Control**: Student, Instructor, and Admin roles
- **Admin Panel**: Manage courses, users, and platform content
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Optimized for mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 5
- **Styling**: Tailwind CSS 3 with custom design system
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Database**: PostgreSQL with Row Level Security (RLS)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (already provisioned)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. The `.env` file is pre-configured with Supabase credentials.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the displayed URL.

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── Navbar.tsx        # Navigation bar with auth state
│   └── Footer.tsx        # Site footer
├── context/
│   └── AuthContext.tsx  # Authentication context with RBAC
├── lib/
│   └── supabase.ts       # Supabase client and TypeScript types
├── pages/                # Application pages
│   ├── LandingPage.tsx
│   ├── SignInPage.tsx
│   ├── SignUpPage.tsx
│   ├── CoursesPage.tsx
│   ├── CourseDetailPage.tsx
│   ├── DashboardPage.tsx
│   ├── AchievementsPage.tsx
│   ├── CertificatesPage.tsx
│   ├── ForumPage.tsx
│   ├── NewTopicPage.tsx
│   ├── NotesPage.tsx
│   ├── ProfilePage.tsx
│   └── AdminPage.tsx
├── router/
│   └── Router.tsx        # Hash-based router with Link component
├── App.tsx               # Main app with routing
├── main.tsx              # Entry point
└── index.css             # Global styles and design system
```

## Database Schema

The platform uses 15 tables with Row Level Security:

- `profiles` - User profiles with roles (student, instructor, admin)
- `categories` - Course categories
- `courses` - Course content
- `modules` - Course modules
- `lessons` - Individual lessons
- `enrollments` - Student enrollments
- `lesson_progress` - Per-lesson completion tracking
- `achievements` - Badge definitions
- `user_achievements` - Earned achievements
- `certificates` - Completion certificates
- `forum_categories` - Forum categories
- `forum_topics` - Discussion topics
- `forum_posts` - Forum replies
- `notes` - Personal notes
- `notifications` - In-app notifications

## Security

- Row Level Security (RLS) on all tables
- Role-based access control (student, instructor, admin)
- Protected routes with automatic redirect
- Input validation on all forms
- Secure session management via Supabase Auth

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## License

MIT
