# Testing

## Testing Strategy

The CyberLearn platform uses multiple layers of quality assurance:

### 1. TypeScript Type Checking
```bash
npm run typecheck
```
Ensures all TypeScript types are correct and no type errors exist. This catches:
- Null/undefined access
- Incorrect function signatures
- Missing properties
- Type mismatches

### 2. ESLint Code Quality
```bash
npm run lint
```
Enforces code quality rules including:
- No unused variables
- No unreachable code
- React hooks rules compliance
- Import ordering

### 3. Production Build
```bash
npm run build
```
Verifies the project compiles for production including:
- All imports resolve
- No syntax errors
- Bundle optimization
- Asset generation

### 4. Manual Testing Checklist

#### Authentication
- [ ] Sign up creates account and profile
- [ ] Sign in authenticates and redirects to dashboard
- [ ] Sign out clears session
- [ ] Protected routes redirect when unauthenticated
- [ ] Role-based access works (student/instructor/admin)

#### Courses
- [ ] Course catalog loads with filters
- [ ] Course detail shows modules and lessons
- [ ] Enrollment works for authenticated users
- [ ] Lesson progress tracking works
- [ ] Course completion updates enrollment status

#### Security Tools
- [ ] Password checker analyzes strength correctly
- [ ] Hash generator produces valid hashes
- [ ] DNS lookup returns records for valid domains
- [ ] HTTP header analyzer grades security headers
- [ ] SSL checker detects HTTPS status
- [ ] CVE search returns vulnerability results
- [ ] URL reputation checker flags suspicious URLs
- [ ] Scan results saved to history

#### AI Assistant
- [ ] New conversation creates session
- [ ] Messages send and receive responses
- [ ] Conversation history persists
- [ ] Suggested questions populate input

#### Forum
- [ ] Forum categories display
- [ ] Topics list within categories
- [ ] New topic creation works
- [ ] Topic view shows posts
- [ ] Reply posting works
- [ ] View count increments

#### Admin Panel
- [ ] Overview stats display correctly
- [ ] Course CRUD operations work
- [ ] User list shows all profiles
- [ ] Scan history tab shows recent scans
- [ ] News tab shows articles

#### UI/UX
- [ ] Dark mode toggle works
- [ ] Responsive layout on mobile/tablet/desktop
- [ ] Animations are smooth
- [ ] Loading states display correctly
- [ ] Empty states show appropriate messages
- [ ] Error states display user-friendly messages

### 5. Browser Compatibility
Tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### 6. Performance Targets
- Lighthouse Performance > 95
- Lighthouse Accessibility > 95
- Lighthouse Best Practices > 95
- Lighthouse SEO > 95
- Bundle size < 400KB gzipped
- First Contentful Paint < 1.5s

## Running Tests

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Production build test
npm run build

# Preview production build
npm run preview
```

## Current Status

All checks pass:
- TypeScript: PASS
- ESLint: PASS
- Production build: PASS (367KB JS, 37KB CSS gzipped)
