# Changelog

All notable changes to the CyberLearn platform are documented in this file.

## [1.0.0] - 2026-07-14

### Added
- Complete cybersecurity learning platform with course management
- User authentication with email/password via Supabase Auth
- Role-based access control (student, instructor, admin)
- Course catalog with 5 pre-seeded cybersecurity courses
- 6 course categories (Web Security, Network Security, Cryptography, Malware Analysis, Digital Forensics, Ethical Hacking)
- Module and lesson system with content delivery
- Student enrollment and lesson progress tracking
- Achievement system with 8 badge definitions
- Certificate generation for completed courses
- Community forum with categories, topics, and replies
- Personal notes system for students
- In-app notifications with unread badge count
- Admin panel for course and user management
- Dark mode with system preference detection
- Responsive design for mobile, tablet, and desktop
- Hash-based routing with protected routes
- Custom design system with Tailwind CSS
- Animations and micro-interactions
- Auto profile creation on signup via database trigger
- Updated_at triggers for relevant tables
- Database indexes for performance optimization
- Row Level Security on all 15 tables
- Comprehensive README documentation

### Security
- RLS policies on every table
- Owner-scoped CRUD for user data
- Admin-only write access for course management
- Protected routes with automatic redirect to sign-in
- Input validation on all forms
- Secure session management via Supabase Auth

## [2.0.0] - 2026-07-14

### Added
- Security Tools page with 10 tools: password strength checker, hash generator, hash identifier, DNS lookup, HTTP headers analyzer, SSL/TLS checker, port scanner, WHOIS lookup, CVE search, URL reputation checker
- Client-side tools (password checker, hash generator, hash identifier) using Web Crypto API
- Edge functions for server-side tools requiring external API calls (Google DNS, NVD CVE)
- AI Security Assistant with conversation persistence and curated knowledge base
- Security News page with search and category filtering
- Scan History page with detail view and downloadable text reports
- Enhanced admin dashboard with 5 tabs: overview, courses, users, scans, news
- Scan history tracking in database
- AI conversation and message persistence in database
- Security news table with admin-managed entries
- Landing page tools showcase section
- Navbar links to all new features (Tools, News, AI Assistant, Scan History)

### Changed
- Expanded protected routes to include /ai-assistant and /scan-history
- Footer updated with links to all platform features
- Landing page features grid expanded to 8 items

### Security
- Edge function CORS headers on all responses
- Auth token forwarding for edge function calls
- RLS policies on scan_history, ai_conversations, ai_messages, and security_news tables
