# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── simple-booking/     # Expo mobile app (SimpleBooking)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## SimpleBooking Mobile App

Expo React Native app for small business appointment management.

**Features:**
- Turkish UI throughout
- Personal account system (register/login) with AsyncStorage
  - No duplicate usernames or emails allowed
  - Only registered users can login
  - Each user's data is completely isolated
- Müşteri (Customer) management: add, view, delete
- Randevu (Appointment) management: add, view, update status, delete
- Calendar view with month navigation and date-based appointment list
- Keyboard-aware forms (keyboard never blocks input)

**App Structure:**
- `context/AuthContext.tsx` — auth state, login, register, logout with AsyncStorage
- `context/DataContext.tsx` — per-user customer and appointment CRUD with AsyncStorage
- `app/_layout.tsx` — root layout with NavigationGuard (auth redirect)
- `app/auth/login.tsx` — login screen
- `app/auth/register.tsx` — registration screen
- `app/(tabs)/index.tsx` — home screen (today's appointments)
- `app/(tabs)/customers.tsx` — customer list with search
- `app/(tabs)/calendar.tsx` — monthly calendar with appointment list
- `app/(tabs)/settings.tsx` — user profile and settings
- `app/add-customer.tsx` — add customer modal
- `app/add-appointment.tsx` — add appointment modal
- `app/appointment/[id].tsx` — appointment detail/edit
- `app/customer/[id].tsx` — customer detail with appointment history

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
