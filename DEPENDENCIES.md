# Dependencies

## Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | React DOM renderer |
| @supabase/supabase-js | ^2.57.4 | Supabase client (auth, database, storage) |
| lucide-react | ^0.344.0 | Icon library |

## Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^5.4.2 | Build tool and dev server |
| @vitejs/plugin-react | ^4.3.1 | Vite React plugin |
| typescript | ^5.5.3 | TypeScript compiler |
| tailwindcss | ^3.4.1 | CSS framework |
| postcss | ^8.4.35 | CSS processing |
| autoprefixer | ^10.4.18 | CSS vendor prefix automation |
| eslint | ^9.9.1 | Code linter |
| @eslint/js | ^9.9.1 | ESLint JS config |
| typescript-eslint | ^8.3.0 | TypeScript ESLint rules |
| eslint-plugin-react-hooks | ^5.1.0-rc.0 | React hooks linting rules |
| eslint-plugin-react-refresh | ^0.4.11 | React Refresh linting |
| globals | ^15.9.0 | Global variables for ESLint |
| @types/react | ^18.3.5 | React type definitions |
| @types/react-dom | ^18.3.0 | React DOM type definitions |

## Runtime Requirements

- Node.js 18+
- A modern web browser with ES2020+ support
- Supabase project (pre-provisioned)

## No External UI Dependencies

This project deliberately avoids external UI component libraries. All UI is built with:
- Tailwind CSS for styling
- Lucide React for icons
- Custom React components

This keeps the bundle size small and the design fully customizable.
