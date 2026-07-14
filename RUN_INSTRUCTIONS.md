# Run Instructions

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the URL shown in the terminal (typically http://localhost:5173)

## Production Build

1. Build the project:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

## Type Checking

```bash
npm run typecheck
```

## Linting

```bash
npm run lint
```

## Environment Variables

The `.env` file is pre-configured with:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

No additional configuration is needed.

## Database

The Supabase database is pre-provisioned with all tables, RLS policies, triggers, and seed data. No manual database setup is required.

## Creating an Account

1. Navigate to the app
2. Click "Get Started" or "Sign Up"
3. Enter your display name, email, and password
4. Your account is created with the "student" role
5. Start browsing and enrolling in courses

## Admin Access

To access the admin panel, a user's role must be set to "admin" or "instructor" in the database. This can be done via the Supabase dashboard by updating the `profiles` table.
