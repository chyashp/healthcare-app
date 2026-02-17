# HealthConnect — Healthcare Appointment System

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Requirements](#2-requirements)
3. [Tech Stack & Why Each Tool Was Chosen](#3-tech-stack--why-each-tool-was-chosen)
4. [Project Structure](#4-project-structure)
5. [Database Design](#5-database-design)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Application Architecture](#7-application-architecture)
8. [Component Breakdown](#8-component-breakdown)
9. [Data Flow & State Management](#9-data-flow--state-management)
10. [Role-Based Dashboard System](#10-role-based-dashboard-system)
11. [Appointment Booking Flow](#11-appointment-booking-flow)
12. [Video Consultation (Mock UI)](#12-video-consultation-mock-ui)
13. [Dark Mode Implementation](#13-dark-mode-implementation)
14. [Styling with Tailwind CSS 4](#14-styling-with-tailwind-css-4)
15. [Supabase Configuration](#15-supabase-configuration)
16. [Deployment to Vercel](#16-deployment-to-vercel)
17. [Seeding Demo Data](#17-seeding-demo-data)
18. [Gotchas & Lessons Learned](#18-gotchas--lessons-learned)
19. [Things to Improve](#19-things-to-improve)
20. [Key Engineering Decisions](#20-key-engineering-decisions)

---

## 1. Project Overview

HealthConnect is a full-stack healthcare appointment system with role-based dashboards for three user types: Patients, Doctors, and Admins. Patients can book appointments and view medical records. Doctors manage schedules, handle appointments, and create medical records. Admins oversee the entire system — users, departments, and all appointments.

**Live URL:** https://healthcare-app-wine-delta.vercel.app
**Source Code:** https://github.com/chyashp/healthcare-app

### What It Demonstrates

- Building a multi-role application with Next.js 15 App Router where each role has completely different views and capabilities
- Implementing role-based middleware that reads user metadata and restricts route access at the edge
- Using Supabase Row Level Security (RLS) with policies that differ per role — patients see own data, doctors see assigned data, admins see everything
- Managing global state with Redux Toolkit alongside Supabase's real-time auth
- Creating a complex multi-step booking flow (department → doctor → date/time → confirm)
- Building a mock video consultation UI demonstrating the frontend architecture for a real-time feature
- Deploying to Vercel with Supabase as the backend

---

## 2. Requirements

### Functional Requirements

| ID   | Feature                  | Description                                                                                           |
|------|--------------------------|-------------------------------------------------------------------------------------------------------|
| FR-1 | Authentication           | Email/password signup with role selection (Patient or Doctor). Auto-create profile via database trigger. Session-based auth via cookies. |
| FR-2 | Role-Based Dashboards    | Three separate dashboard areas: Patient, Doctor, Admin. Each with unique navigation, pages, and data access. |
| FR-3 | Appointment Booking      | 4-step booking flow: select department → select doctor → pick date/time (validated against doctor schedule) → confirm. |
| FR-4 | Doctor Schedule Management | Doctors set weekly availability (day, start time, end time). Patients can only book during available slots. |
| FR-5 | Appointment Management   | Patients can cancel. Doctors can confirm, start, complete, or mark no-show. Admins can view all appointments. |
| FR-6 | Medical Records          | Doctors create records (diagnosis, prescription, notes) linked to patients. Patients view their own records. |
| FR-7 | Video Consultation       | Mock video call UI with controls (mic, camera, screen share, end call), chat panel, and appointment details. |
| FR-8 | Admin Management         | Admin overview with system KPIs, user management with role filtering, department CRUD. |
| FR-9 | Route Protection         | Middleware enforces role-based access — patients cannot access `/dashboard/doctor`, etc. |
| FR-10 | Dark Mode               | Persistent dark/light theme toggle with no flash on page load. |
| FR-11 | Landing Page             | Public marketing page with hero, feature highlights, and call-to-action buttons. |

### Non-Functional Requirements

| ID    | Category      | Requirement                                                                    |
|-------|---------------|--------------------------------------------------------------------------------|
| NFR-1 | Responsive    | Fully usable on mobile, tablet, and desktop. Sidebar collapses to hamburger.   |
| NFR-2 | Security      | RLS on every table. Patients see own data, doctors see assigned data, admins see all. |
| NFR-3 | Type Safety   | TypeScript strict mode. All database entities and component props are typed.     |
| NFR-4 | Performance   | Skeleton loading states on every dashboard page. No layout shift.               |
| NFR-5 | Data Realism  | Seed function generates 180 appointments, 50+ medical records, 5 doctors, 10 patients. |

---

## 3. Tech Stack & Why Each Tool Was Chosen

### Next.js 15 (App Router) — Framework

Next.js provides the full-stack React framework. The App Router enables:

- **File-based routing:** Each folder under `src/app/` becomes a route. `/dashboard/patient/appointments` maps to `src/app/dashboard/patient/appointments/page.tsx`.
- **Nested layouts:** The dashboard layout (sidebar + content area) wraps all dashboard routes without re-rendering when navigating between pages.
- **Route groups:** `(auth)` groups login and signup without adding `/auth/` to the URL path.
- **Middleware:** `middleware.ts` intercepts every matched request for auth checks and role enforcement before the page renders.

**Why not plain React?** A React SPA would require manual routing, no SSR, a separate backend, and no middleware. Next.js combines routing, server rendering, API routes, and middleware into one framework.

### TypeScript 5 (Strict Mode) — Language

TypeScript adds static type checking. Every database entity has an interface in `src/types/database.ts`. The `Appointment` interface, for example, includes optional nested `doctor`, `patient`, and `department` objects that match Supabase's PostgREST join syntax:

```typescript
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  department_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  doctor?: Partial<Profile>;
  patient?: Partial<Profile>;
  department?: Partial<Department>;
}
```

Strict mode catches bugs at compile time — for example, `appointment.reason` is `string | null`, so passing it to a prop that expects `string | undefined` requires explicit handling (`reason || undefined`).

### Supabase — Backend (Database + Auth + Storage)

Supabase provides:

- **PostgreSQL Database:** 5 tables with foreign keys, check constraints, indexes, and triggers. The schema enforces data integrity — for example, `appointment.status` can only be one of 6 values, enforced at the database level.
- **Authentication:** Email/password auth with role stored in `user_metadata`. The signup form passes `role: "patient"` or `role: "doctor"` in the metadata, and a database trigger reads it to set the profile role.
- **Row Level Security (RLS):** Per-role policies. The `appointments` table has 7 separate policies — patients see own appointments, doctors see assigned appointments, admins see all.
- **PostgREST Joins:** Supabase's query builder supports foreign key-based joins via hint syntax: `profiles!appointments_doctor_profile_fkey(full_name, avatar_url)`. This fetches related profile data in a single query without writing SQL joins.
- **Storage:** An `avatars` bucket for profile picture uploads.
- **Supabase SSR (`@supabase/ssr`):** Cookie-based auth that works with server-rendered pages and middleware.

**Why not Firebase?** Supabase uses PostgreSQL with real foreign keys, joins, check constraints, and RLS policies. Firebase Firestore is NoSQL — it can't enforce relational integrity or role-based row-level access at the database level.

### Redux Toolkit — State Management

Unlike the ecom-dash project (which uses only React hooks), HealthConnect uses Redux Toolkit because:

- **Auth state is global:** The user's role, name, and avatar are needed across every page (sidebar, header, data queries).
- **Multiple slices of state:** Auth, UI (sidebar open/closed, active modal), and appointments data are separate concerns that benefit from a centralized store.
- **Consistency across navigations:** When a user navigates between patient pages, their auth state shouldn't re-fetch from Supabase on every page.

Three slices:
- **`auth`** — `userId`, `role`, `fullName`, `avatarUrl`, `loading`
- **`ui`** — `sidebarOpen`, `activeModal`
- **`appointments`** — `list`, `selected`, `statusFilter`, `loading`

### Tailwind CSS 4 — Styling

Tailwind CSS 4 moves configuration into CSS using `@theme inline` blocks. This project defines a teal brand palette (distinct from the orange used in ecom-dash):

```css
@theme inline {
  --color-brand-500: #14b8a6;  /* teal primary */
  --color-brand-600: #0d9488;  /* teal hover */
}
```

This generates utility classes like `bg-brand-500`, `text-brand-600`, `border-brand-300` that are used throughout the UI.

### Vercel — Hosting

Zero-config deployment. Push to `main` → Vercel auto-detects Next.js → builds → deploys to edge network. Environment variables for Supabase are set in the Vercel project settings.

---

## 4. Project Structure

```
healthcare-app/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout (fonts, dark mode script, Redux provider)
│   │   ├── page.tsx                      # Public landing page (hero, features, CTA)
│   │   ├── globals.css                   # Tailwind CSS 4 config + teal theme palette
│   │   ├── (auth)/                       # Auth route group (no layout nesting)
│   │   │   ├── login/page.tsx            # Login form
│   │   │   └── signup/page.tsx           # Signup form with role selection
│   │   ├── auth/
│   │   │   └── callback/route.ts         # Supabase OAuth callback handler
│   │   └── dashboard/                    # Protected dashboard routes
│   │       ├── layout.tsx                # Dashboard shell (sidebar + content area)
│   │       ├── loading.tsx               # Skeleton loading state
│   │       ├── error.tsx                 # Error boundary
│   │       ├── patient/                  # Patient-only routes
│   │       │   ├── page.tsx              # Patient overview (KPIs, upcoming appointments)
│   │       │   ├── book/page.tsx         # 4-step appointment booking
│   │       │   ├── appointments/page.tsx # Appointments list with tab filters
│   │       │   ├── records/page.tsx      # Medical records (expandable cards)
│   │       │   ├── consultation/page.tsx # Video consultation (patient view)
│   │       │   └── settings/page.tsx     # Profile editor + theme toggle
│   │       ├── doctor/                   # Doctor-only routes
│   │       │   ├── page.tsx              # Doctor overview (today's appointments, KPIs)
│   │       │   ├── schedule/page.tsx     # Weekly availability editor
│   │       │   ├── appointments/page.tsx # All appointments with status actions
│   │       │   ├── records/page.tsx      # Patient records + "Add Record" modal
│   │       │   ├── consultation/page.tsx # Video consultation (doctor view)
│   │       │   └── settings/page.tsx     # Profile + specialization editor
│   │       └── admin/                    # Admin-only routes
│   │           ├── page.tsx              # System overview (6 KPIs, recent users/appointments)
│   │           ├── users/page.tsx        # User table with role filter and search
│   │           ├── departments/page.tsx  # Department CRUD (add, edit, delete)
│   │           ├── appointments/page.tsx # All appointments across the system
│   │           └── settings/page.tsx     # Admin profile editor
│   │
│   ├── components/
│   │   ├── ui/                           # Generic UI primitives
│   │   │   ├── Button.tsx                # Variants: primary/secondary/outline/ghost/danger
│   │   │   ├── Card.tsx                  # Card, CardHeader, CardContent
│   │   │   ├── Badge.tsx                 # Appointment status badge with color dots
│   │   │   ├── Input.tsx                 # Styled form input
│   │   │   ├── Select.tsx                # Styled dropdown select
│   │   │   ├── Modal.tsx                 # Dialog overlay with backdrop
│   │   │   ├── Avatar.tsx                # Profile image with initials fallback
│   │   │   └── EmptyState.tsx            # Empty list placeholder
│   │   ├── layout/                       # Dashboard chrome
│   │   │   ├── Sidebar.tsx               # Role-aware navigation (Patient/Doctor/Admin menus)
│   │   │   ├── MobileSidebar.tsx         # Hamburger drawer for mobile
│   │   │   └── DashboardHeader.tsx       # Page title, subtitle, action buttons
│   │   ├── shared/                       # Domain-specific shared components
│   │   │   ├── AppointmentCard.tsx       # Reusable appointment card with role-specific actions
│   │   │   └── VideoConsultation.tsx     # Mock video call UI
│   │   └── landing/                      # Landing page sections
│   │       ├── Hero.tsx                  # Hero with SVG illustration
│   │       └── Features.tsx              # Feature cards grid
│   │
│   ├── store/                            # Redux Toolkit
│   │   ├── index.ts                      # configureStore with 3 slices
│   │   ├── provider.tsx                  # ReduxProvider ("use client" wrapper)
│   │   └── slices/
│   │       ├── auth.ts                   # User auth state
│   │       ├── ui.ts                     # Sidebar, modals
│   │       └── appointments.ts           # Appointment list and filters
│   │
│   ├── hooks/
│   │   ├── use-auth.ts                   # Syncs Supabase session → Redux
│   │   ├── use-theme.ts                  # Dark mode toggle with localStorage
│   │   └── use-redux.ts                  # Typed useAppDispatch/useAppSelector
│   │
│   ├── lib/
│   │   ├── utils.ts                      # classNames, formatDate, formatTime, status colors
│   │   └── supabase/
│   │       ├── client.ts                 # Browser Supabase client
│   │       ├── server.ts                 # Server Supabase client (cookie-based)
│   │       └── middleware.ts             # Auth + role-based route protection
│   │
│   ├── types/
│   │   └── database.ts                   # All TypeScript interfaces
│   │
│   └── middleware.ts                      # Next.js middleware entry (route matcher)
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql        # Tables, RLS policies, indexes, triggers
│   │   └── 002_add_profile_foreign_keys.sql  # PostgREST join FKs
│   ├── seed.sql                          # Reusable seed function
│   └── seed_demo.sql                     # Pre-built demo data with auth users
│
├── public/
│   └── illustrations/                    # unDraw SVGs for landing page
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── .env.example
```

### Why This Structure?

- **`patient/`, `doctor/`, `admin/`** directories under `dashboard/` create a clean separation of role-specific pages. Each role's routes are self-contained.
- **`components/ui/`** contains generic, reusable primitives. **`components/shared/`** contains domain-specific components used by multiple roles (like `AppointmentCard` used by both patient and doctor views).
- **`store/`** centralizes Redux state because auth data is needed globally (sidebar, queries, route decisions).
- **`(auth)`** route group groups login/signup without adding `/auth/` to URLs, so the routes are `/login` and `/signup`.

---

## 5. Database Design

### Entity Relationship

```
auth.users (Supabase-managed)
    │
    ├── 1:1 ──── profiles (auto-created via trigger, stores role + contact info)
    │                │
    │                ├── references ── departments (doctor's department)
    │                │
    │                └── linked via user_id to:
    │
    ├── 1:many ── doctor_schedules (weekly availability)
    │
    ├── 1:many ── appointments (as patient_id or doctor_id)
    │                │
    │                ├── references ── departments
    │                └── linked to ── medical_records
    │
    └── 1:many ── medical_records (as patient_id or doctor_id)
```

### Tables

#### `departments`

```sql
create table public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  icon        text,
  created_at  timestamptz default now() not null
);
```

6 departments: General Medicine, Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology. The `unique` constraint on `name` allows idempotent seeding with `ON CONFLICT (name) DO NOTHING`.

#### `profiles`

```sql
create table public.profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null unique,
  role            text not null default 'patient' check (role in ('patient', 'doctor', 'admin')),
  full_name       text,
  avatar_url      text,
  phone           text,
  date_of_birth   date,
  address         text,
  department_id   uuid references public.departments(id),
  specialization  text,
  bio             text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);
```

The `check` constraint on `role` ensures only valid roles are stored. `department_id`, `specialization`, and `bio` are only used for doctors but stored in the same table to avoid a separate `doctor_profiles` join table.

**Auto-creation trigger:**

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'patient'),
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;
```

The trigger reads `role` from `user_metadata` (set during signup). `coalesce` defaults to `'patient'` if no role is provided. `SECURITY DEFINER` allows the function to bypass RLS when inserting the profile.

#### `doctor_schedules`

```sql
create table public.doctor_schedules (
  id           uuid primary key default gen_random_uuid(),
  doctor_id    uuid references auth.users(id) on delete cascade not null,
  day_of_week  integer not null check (day_of_week between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  is_available boolean default true not null,
  created_at   timestamptz default now() not null,
  unique(doctor_id, day_of_week)
);
```

`day_of_week` uses JavaScript convention: 0 = Sunday, 6 = Saturday. The `unique(doctor_id, day_of_week)` constraint prevents duplicate schedule entries for the same day.

#### `appointments`

```sql
create table public.appointments (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid references auth.users(id) on delete cascade not null,
  doctor_id        uuid references auth.users(id) on delete cascade not null,
  department_id    uuid references public.departments(id) not null,
  appointment_date date not null,
  start_time       time not null,
  end_time         time not null,
  status           text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  type             text not null default 'in_person'
    check (type in ('in_person', 'video')),
  reason           text,
  notes            text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);
```

Both `patient_id` and `doctor_id` reference `auth.users(id)`. This is important — they reference the auth table, not the profiles table directly. See [Gotchas](#18-gotchas--lessons-learned) for why this matters.

The 6-status lifecycle: `scheduled` → `confirmed` → `in_progress` → `completed` (or `cancelled`/`no_show` at any point).

#### `medical_records`

```sql
create table public.medical_records (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid references auth.users(id) on delete cascade not null,
  doctor_id      uuid references auth.users(id) on delete cascade not null,
  appointment_id uuid references public.appointments(id),
  diagnosis      text not null,
  prescription   text,
  notes          text,
  created_at     timestamptz default now() not null
);
```

`appointment_id` is optional — a doctor can create a record without linking it to a specific appointment.

### Row Level Security (RLS)

All 5 tables have RLS enabled. The policies implement a tiered access model:

**Appointments — 7 policies:**

```sql
-- Patients see own appointments
create policy "Patients can view own appointments"
  on public.appointments for select
  using (auth.uid() = patient_id);

-- Doctors see assigned appointments
create policy "Doctors can view assigned appointments"
  on public.appointments for select
  using (auth.uid() = doctor_id);

-- Admin sees all
create policy "Admin can view all appointments"
  on public.appointments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );
```

The admin policy uses a subquery to check the user's role in the `profiles` table. This is more secure than trusting client-side role claims — even if someone modified their JWT metadata, the database checks the actual profile.

**Departments — readable by all authenticated users, writable only by admins.** This allows patients and doctors to view department lists (for booking) while restricting management to admins.

### Foreign Keys for PostgREST Joins

A second migration (`002_add_profile_foreign_keys.sql`) adds direct foreign keys from `appointments` and `medical_records` to `profiles(user_id)`:

```sql
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_patient_profile_fkey
  FOREIGN KEY (patient_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_doctor_profile_fkey
  FOREIGN KEY (doctor_id) REFERENCES public.profiles(user_id);
```

These FKs exist alongside the original FKs to `auth.users(id)`. They enable Supabase PostgREST join syntax like:

```typescript
.select("*, doctor:profiles!appointments_doctor_profile_fkey(full_name, avatar_url)")
```

See [Gotchas](#18-gotchas--lessons-learned) for why this migration was necessary.

### Indexes

```sql
create index idx_profiles_user_id          on public.profiles(user_id);
create index idx_profiles_role             on public.profiles(role);
create index idx_profiles_department_id    on public.profiles(department_id);
create index idx_doctor_schedules_doctor_id on public.doctor_schedules(doctor_id);
create index idx_appointments_patient_id   on public.appointments(patient_id);
create index idx_appointments_doctor_id    on public.appointments(doctor_id);
create index idx_appointments_date         on public.appointments(appointment_date);
create index idx_appointments_status       on public.appointments(status);
create index idx_appointments_department_id on public.appointments(department_id);
create index idx_medical_records_patient_id on public.medical_records(patient_id);
create index idx_medical_records_doctor_id on public.medical_records(doctor_id);
```

The index on `appointment_date` is critical for the doctor dashboard's "today's appointments" query and the patient dashboard's "upcoming appointments" query.

---

## 6. Authentication & Authorization

### Signup Flow

1. User fills the signup form (`/signup`) with full name, email, password, and role (Patient or Doctor radio buttons)
2. Client calls `supabase.auth.signUp()` with `role` and `full_name` in `options.data` (user metadata)
3. Supabase creates a row in `auth.users` with hashed password and stores the metadata
4. The `on_auth_user_created` trigger fires, creating a `profiles` row with the role from metadata
5. Supabase returns a session token stored as an HTTP-only cookie
6. The app redirects to `/dashboard` (middleware then redirects to `/dashboard/{role}`)

The signup form restricts role selection to `patient` and `doctor` — admin accounts are created manually through the Supabase dashboard or seed script.

### Login Flow

1. User enters email and password at `/login`
2. Client calls `supabase.auth.signInWithPassword()`
3. Supabase verifies credentials, returns a session with user metadata containing the role
4. Redirect to `/dashboard/{role}` based on `user.user_metadata.role`

### Role-Based Middleware

The middleware (`src/lib/supabase/middleware.ts`) enforces four rules:

```
1. Unauthenticated user on /dashboard/* → redirect to /login
2. Authenticated user on /login or /signup → redirect to /dashboard/{role}
3. User on /dashboard (no role path) → redirect to /dashboard/{role}
4. User accessing wrong role's dashboard → redirect to own /dashboard/{role}
```

Rule 4 is the key difference from ecom-dash. The middleware reads `user.user_metadata.role` and checks if the URL path contains the correct role segment:

```typescript
const role = user.user_metadata?.role;
const path = request.nextUrl.pathname;

if (role && path.startsWith("/dashboard")) {
  const allowedPath = `/dashboard/${role}`;
  if (!path.startsWith(allowedPath) && path !== "/dashboard") {
    return NextResponse.redirect(new URL(allowedPath, request.url));
  }
}
```

### Two Supabase Clients

| Client | File | Used In | Session From |
|--------|------|---------|--------------|
| `createBrowserClient` | `client.ts` | Client Components (`"use client"`) | Cookies (browser) |
| `createServerClient` | `server.ts` | Server Components, middleware | Cookies (request headers) |

Both use the same project URL and anon key. The difference is how they access the session cookie.

### Auth State Sync (useAuth Hook)

The `useAuth` hook bridges Supabase auth and Redux:

```typescript
// Simplified flow
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      // Fetch profile for role, name, avatar
      supabase.from("profiles").select("role, full_name, avatar_url")
        .eq("user_id", user.id).single()
        .then(({ data: profile }) => {
          dispatch(setUser({
            userId: user.id,
            role: profile?.role || user.user_metadata?.role,
            fullName: profile?.full_name,
            avatarUrl: profile?.avatar_url,
          }));
        });
    } else {
      dispatch(clearUser());
    }
  });

  // Subscribe to auth changes (logout detection)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") dispatch(clearUser());
  });

  return () => subscription.unsubscribe();
}, [dispatch]);
```

This runs once on mount in the dashboard layout, populating Redux with the user's auth data. All child pages read from Redux via `useAppSelector`.

---

## 7. Application Architecture

### Rendering Strategy

| Route | Rendering | Why |
|-------|-----------|-----|
| `/` (landing) | Client Component | Interactive nav, theme toggle |
| `/login`, `/signup` | Client Component | Form state, auth calls |
| `/dashboard/patient/*` | Client Component | Real-time data, interactive booking flow |
| `/dashboard/doctor/*` | Client Component | Status updates, schedule editing, record creation |
| `/dashboard/admin/*` | Client Component | Filtering, search, CRUD operations |
| `/auth/callback` | Route Handler | Server-side OAuth code exchange |

All dashboard pages are `"use client"` because they need:
- `useAuth()` hook for the current user's ID and role
- `useState` for form inputs, filters, and loading states
- `createClient()` for Supabase queries with the user's session

### Layout Nesting

```
Root Layout (layout.tsx)
├── Landing Page (page.tsx)                           — no sidebar
├── Auth Group ((auth)/)
│   ├── Login (login/page.tsx)                        — no sidebar
│   └── Signup (signup/page.tsx)                      — no sidebar
└── Dashboard Layout (dashboard/layout.tsx)            — has sidebar
    ├── Patient Routes (patient/)
    │   ├── Overview (page.tsx)
    │   ├── Book Appointment (book/page.tsx)
    │   ├── Appointments (appointments/page.tsx)
    │   ├── Records (records/page.tsx)
    │   ├── Consultation (consultation/page.tsx)
    │   └── Settings (settings/page.tsx)
    ├── Doctor Routes (doctor/)
    │   ├── Overview (page.tsx)
    │   ├── Schedule (schedule/page.tsx)
    │   ├── Appointments (appointments/page.tsx)
    │   ├── Records (records/page.tsx)
    │   ├── Consultation (consultation/page.tsx)
    │   └── Settings (settings/page.tsx)
    └── Admin Routes (admin/)
        ├── Overview (page.tsx)
        ├── Users (users/page.tsx)
        ├── Departments (departments/page.tsx)
        ├── Appointments (appointments/page.tsx)
        └── Settings (settings/page.tsx)
```

The Dashboard Layout provides the sidebar and main content container. The Sidebar component reads the user's role from `useAuth()` and renders the appropriate navigation menu.

---

## 8. Component Breakdown

### UI Components (`src/components/ui/`)

#### `Button` — Multi-variant action button
Props: `variant` (primary/secondary/outline/ghost/danger), `size` (sm/md/lg), `loading`, `disabled`, `children`

The `loading` prop shows a spinning SVG and disables the button:
```tsx
<Button loading={submitting}>Save Record</Button>
// Renders: [spinner] "Save Record" (disabled)
```

#### `Card` — Container with header and content sections
Compound component pattern:
```tsx
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

#### `Badge` — Status indicator with colored dot
Maps appointment status to semantic colors:
- `scheduled` → Blue
- `confirmed` → Green
- `in_progress` → Yellow
- `completed` → Gray
- `cancelled` → Red
- `no_show` → Orange

#### `Modal` — Dialog overlay
Props: `isOpen`, `onClose`, `title`. Used for the "Add Medical Record" form in the doctor records page and department editing in admin.

#### `Avatar` — Profile image with fallback
Takes `src` (Supabase Storage URL) and `name`. If `src` is null, renders the initials from `name` in a colored circle. The color is deterministic based on the name string.

### Layout Components (`src/components/layout/`)

#### `Sidebar` — Role-aware navigation

The sidebar renders different navigation items based on the user's role:

```typescript
const patientLinks = [
  { href: "/dashboard/patient", label: "Overview", icon: HomeIcon },
  { href: "/dashboard/patient/book", label: "Book Appointment", icon: PlusIcon },
  { href: "/dashboard/patient/appointments", label: "My Appointments", icon: CalendarIcon },
  { href: "/dashboard/patient/records", label: "Medical Records", icon: DocumentIcon },
  { href: "/dashboard/patient/consultation", label: "Video Consultation", icon: VideoIcon },
  { href: "/dashboard/patient/settings", label: "Settings", icon: CogIcon },
];
```

Active route detection uses `pathname.startsWith(href)` with a special case for the root dashboard path (exact match only).

The sidebar also includes:
- Dark mode toggle button (sun/moon icon)
- User info (name, role badge) at the bottom
- Sign out button

#### `MobileSidebar` — Hamburger drawer
On screens below `lg` breakpoint, the sidebar is hidden and a hamburger button appears in the top-left. Tapping it opens a slide-out drawer with the same navigation, overlaid with a semi-transparent backdrop.

#### `DashboardHeader` — Page title bar
Props: `title`, `subtitle`, `actions`. The `actions` prop slot is used for page-specific buttons:
```tsx
<DashboardHeader
  title="Patient Records"
  actions={<Button onClick={() => setShowForm(true)}>Add Record</Button>}
/>
```

### Shared Components (`src/components/shared/`)

#### `AppointmentCard` — Role-adaptive appointment display

The card renders differently based on `viewAs` prop:
- **Patient view:** Shows doctor name, specialization, department. Action: "Cancel" (for scheduled/confirmed)
- **Doctor view:** Shows patient name. Actions: "Confirm" (scheduled), "Start" (confirmed), "Complete" (in_progress)

```tsx
<AppointmentCard
  appointment={appt}
  viewAs="doctor"
  onAction={(action, appointment) => handleStatusUpdate(action, appointment)}
/>
```

#### `VideoConsultation` — Mock video UI

A full-screen video consultation interface:
- Large video area with participant avatar and "Waiting for..." text
- Self-view box (bottom-right)
- Control bar: mic, camera, screen share, chat toggle, end call
- Side panel: appointment details, text chat, notes (doctor-only)
- Demo banner explaining this is a mock

---

## 9. Data Flow & State Management

### Redux Store Architecture

```
Redux Store
├── auth
│   ├── userId: string | null
│   ├── role: "patient" | "doctor" | "admin" | null
│   ├── fullName: string | null
│   ├── avatarUrl: string | null
│   └── loading: boolean
├── ui
│   ├── sidebarOpen: boolean
│   └── activeModal: string | null
└── appointments
    ├── list: Appointment[]
    ├── selected: Appointment | null
    ├── statusFilter: string
    └── loading: boolean
```

### Data Fetching Pattern

Every dashboard page follows the same pattern:

```typescript
export default function SomePage() {
  const { userId } = useAuth();          // 1. Get user ID from Redux
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;                  // 2. Wait for auth to load

    async function fetchData() {
      const supabase = createClient();    // 3. Create browser client
      const { data } = await supabase     // 4. Query with user context
        .from("appointments")
        .select("*, doctor:profiles!appointments_doctor_profile_fkey(full_name)")
        .eq("patient_id", userId);
      setData(data || []);
      setLoading(false);
    }

    fetchData();
  }, [userId]);                           // 5. Re-fetch when userId changes

  if (loading) return <Skeleton />;       // 6. Show skeleton while loading
  return <DataView data={data} />;        // 7. Render data
}
```

Key points:
- `useAuth()` returns `userId` from Redux (populated by the auth hook in the dashboard layout)
- `createClient()` creates a browser Supabase client that includes the user's session cookie
- RLS policies automatically filter results to only the data this user can see
- The `useEffect` dependency on `userId` handles the case where auth loads after the component mounts

### PostgREST Join Syntax

Supabase queries use FK hint syntax to join related tables:

```typescript
// Fetch appointments with doctor profile and department name
const { data } = await supabase
  .from("appointments")
  .select(`
    *,
    doctor:profiles!appointments_doctor_profile_fkey(full_name, avatar_url, specialization),
    department:departments(name)
  `)
  .eq("patient_id", userId);
```

This returns:
```json
{
  "id": "...",
  "patient_id": "...",
  "doctor_id": "...",
  "doctor": { "full_name": "Dr. Sarah Chen", "avatar_url": null, "specialization": "Internal Medicine" },
  "department": { "name": "General Medicine" }
}
```

The `!appointments_doctor_profile_fkey` hint tells PostgREST which foreign key to use for the join, since `doctor_id` has FKs to both `auth.users` and `profiles`.

---

## 10. Role-Based Dashboard System

### Patient Dashboard

**Overview page** — 3 KPIs (upcoming, total visits, completed) + upcoming appointments list
- KPIs use `count` queries: `.select("*", { count: "exact", head: true })`
- Upcoming appointments filtered by `appointment_date >= today` and status `scheduled`/`confirmed`

**Book Appointment** — 4-step flow (see [Section 11](#11-appointment-booking-flow))

**Appointments List** — Tab filters: All, Upcoming, Completed, Cancelled
- Client-side filtering on the full appointment list
- "Cancel" action updates status to `cancelled` via Supabase `.update()`

**Medical Records** — Expandable cards showing diagnosis, prescription, notes
- Click to expand/collapse each record
- Shows doctor name and date

### Doctor Dashboard

**Overview page** — 4 KPIs (today, this week, pending, completed) + today's appointment list
- Today's appointments have action buttons: Confirm, Start, Complete
- Status updates refresh the list in-place

**Schedule** — Weekly availability editor
- 7 day rows (Sunday-Saturday)
- Toggle available/not available
- Set start and end times
- Saves via upsert: `.upsert()` with `onConflict: "doctor_id,day_of_week"`

**Appointments** — All appointments with status tab filters
- 5 tabs: All, Scheduled, Confirmed, In Progress, Completed
- Each card has role-appropriate actions

**Patient Records** — Records list + "Add Record" modal
- Records list shows patient name, diagnosis, date
- "Add Record" modal has a patient dropdown populated from completed appointments
- Creating a record inserts into `medical_records` with the doctor's ID

### Admin Dashboard

**Overview page** — 6 KPIs + recent users + recent appointments
- Uses `Promise.all` to fetch all counts in parallel
- Shows latest 5 users and 5 appointments

**Users** — Searchable, filterable user table
- Role filter buttons: All, Patient, Doctor, Admin
- Search by name (client-side `.filter()`)
- Displays role badges

**Departments** — CRUD interface
- Add, edit, delete departments
- Each department shown as a card with name and description

---

## 11. Appointment Booking Flow

The booking page (`/dashboard/patient/book`) implements a multi-step wizard:

### Step 1: Select Department

```typescript
const { data } = await supabase.from("departments").select("*").order("name");
```

Departments are displayed as clickable cards. Selecting one fetches doctors in that department.

### Step 2: Select Doctor

```typescript
const { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("role", "doctor")
  .eq("department_id", dept.id);
```

Doctors are shown with avatar, name, specialization, and bio. Selecting a doctor fetches their schedule.

### Step 3: Select Date & Time

```typescript
const { data } = await supabase
  .from("doctor_schedules")
  .select("*")
  .eq("doctor_id", doctor.user_id)
  .eq("is_available", true);
```

The date picker validates against the doctor's available days:

```typescript
function isDateAvailable(dateStr: string): boolean {
  const date = new Date(dateStr + "T12:00:00");
  const dayOfWeek = date.getDay();
  return getAvailableDays().includes(dayOfWeek);
}
```

Time slots are a fixed grid of 30-minute intervals from 9:00 AM to 4:30 PM. Selecting a date and time enables the "Continue" button.

### Step 4: Confirm

Shows a summary of the appointment and allows:
- Choosing appointment type (In-person or Video)
- Adding a reason for the visit
- Submitting the appointment

```typescript
await supabase.from("appointments").insert({
  patient_id: userId,
  doctor_id: selectedDoctor.user_id,
  department_id: selectedDept.id,
  appointment_date: selectedDate,
  start_time: selectedTime,
  end_time: endTime,  // calculated as selectedTime + 30 minutes
  type: appointmentType,
  reason: reason || null,
});
```

After successful insertion, the user is redirected to their appointments list.

---

## 12. Video Consultation (Mock UI)

The `VideoConsultation` component provides a realistic video call interface without actual WebRTC:

### Layout
- **Main area (left):** Large dark video panel with participant avatar, name, and "Waiting for..." dots animation. A self-view box in the bottom-right shows "Camera off" placeholder.
- **Side panel (right):** Appointment details (date, time, department, reason) and a chat interface.
- **Control bar (bottom):** Mic, camera, screen share, chat toggle, end call buttons.

### Props
```typescript
interface VideoConsultationProps {
  participantName: string;
  participantAvatar?: string | null;
  participantRole: "doctor" | "patient";
  appointmentDetails: {
    date: string;
    time: string;
    department?: string;
    reason?: string;
  };
}
```

### Demo Banner
A prominent banner explains: "This is a mock video consultation UI. Camera and audio are not active. In a production version, this would use WebRTC for real-time communication."

### Controls (Visual Only)
All controls toggle visual state (icon changes, color changes) but don't connect to real media APIs:

```typescript
const [isMicOn, setIsMicOn] = useState(true);
const [isCameraOn, setIsCameraOn] = useState(false);
const [isScreenSharing, setIsScreenSharing] = useState(false);
const [isChatOpen, setIsChatOpen] = useState(true);
```

**Future enhancement:** Replace with WebRTC via Daily.co, Twilio, or Agora for real video calls.

---

## 13. Dark Mode Implementation

### The Challenge

Same as any SSR app: flash of incorrect theme. The server renders light HTML, JavaScript loads and switches to dark, causing a visible flash.

### The Solution

Inline `<script>` in the root layout's `<head>`:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          var theme = localStorage.getItem('healthcare-app-theme');
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          }
        } catch(e) {}
      })();
    `,
  }}
/>
```

Runs synchronously before first paint. `suppressHydrationWarning` on `<html>` prevents React hydration warnings.

### useTheme Hook

```typescript
export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("healthcare-app-theme");
    const initial = (stored as "light" | "dark") || "light";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("healthcare-app-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  return { theme, toggleTheme, mounted };
}
```

The `mounted` flag prevents hydration mismatches on theme-dependent icons (sun/moon in sidebar).

---

## 14. Styling with Tailwind CSS 4

### CSS-Based Configuration

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-brand-50: #f0fdfa;
  --color-brand-100: #ccfbf1;
  --color-brand-200: #99f6e4;
  --color-brand-300: #5eead4;
  --color-brand-400: #2dd4bf;
  --color-brand-500: #14b8a6;   /* primary teal */
  --color-brand-600: #0d9488;   /* hover state */
  --color-brand-700: #0f766e;
  --color-brand-800: #115e59;
  --color-brand-900: #134e4a;

  --color-navy-500: #1a365d;    /* headings */
  --color-navy-700: #0f2440;

  --color-sidebar: #111827;
  --color-sidebar-hover: #1f2937;
  --color-sidebar-active: #14b8a6;
}
```

The `@custom-variant dark` directive enables class-based dark mode (toggled by `.dark` class on `<html>`).

### Teal vs Orange

ecom-dash uses orange (`#f97316`). HealthConnect uses teal (`#14b8a6`). This gives each project a distinct visual identity while sharing the same architectural pattern.

### Dark Mode in Components

```tsx
<div className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
  <h2 className="text-gray-900 dark:text-white">Title</h2>
  <p className="text-gray-500 dark:text-gray-400">Subtitle</p>
</div>
```

### Responsive Design

```tsx
{/* KPI grid: 1 col mobile, 2 cols tablet, 3 or 4 cols desktop */}
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

{/* Sidebar: hidden mobile, fixed 256px desktop */}
<aside className="hidden lg:flex fixed inset-y-0 left-0 w-64">

{/* Content: full width mobile, offset by sidebar desktop */}
<main className="lg:pl-64 p-4 sm:p-6 lg:p-8">
```

---

## 15. Supabase Configuration

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

The `NEXT_PUBLIC_` prefix exposes these to the browser. This is safe because the anon key only grants access that RLS policies allow.

### Auth Settings

- **Site URL:** Set to the Vercel production URL. This is the base URL for auth confirmation emails.
- **Email confirmations:** Should be configured based on your needs. During development, disabling confirmation reduces friction.
- **Redirect URLs:** Add both `http://localhost:3000/**` and the Vercel URL.

### Storage

Create an `avatars` bucket (public) for profile picture uploads. The `next.config.ts` allows Supabase CDN images:

```typescript
images: {
  remotePatterns: [{ hostname: "*.supabase.co", pathname: "/storage/**" }],
}
```

---

## 16. Deployment to Vercel

### Setup

1. Push code to GitHub (`chyashp/healthcare-app`)
2. Create Vercel project, connect to the repo
3. Set environment variables in Vercel project settings
4. Deploy (automatic on push to `main`)

### Continuous Deployment

Every push to `main`:
1. Vercel detects via webhook
2. Clones repo, runs `next build`
3. Deploys to edge network
4. Updates production URL

### Database Setup (Manual, One-Time)

1. Create a Supabase project
2. Run `001_initial_schema.sql` in SQL Editor
3. Run `002_add_profile_foreign_keys.sql` in SQL Editor
4. Run `seed.sql` for departments
5. Create users via signup or seed script
6. Run `seed_demo.sql` for demo data (optional)

---

## 17. Seeding Demo Data

### Two Approaches

**Approach 1: Manual seeding** (`seed.sql`)
- Inserts departments
- Defines a `seed_healthcare_data()` function
- You create users via signup, then call the function with their UUIDs

```sql
SELECT seed_healthcare_data(
  admin_uid   := 'uuid-of-admin',
  doctor_uids := ARRAY['uuid-doc-1', 'uuid-doc-2', ...],
  patient_uids := ARRAY['uuid-pat-1', 'uuid-pat-2', ...]
);
```

**Approach 2: Full demo seed** (`seed_demo.sql`)
- Creates 8 auth users directly in the database (with bcrypt passwords)
- Creates auth.identities entries (required for Supabase login)
- Seeds profiles, schedules, 48+ appointments, 19+ medical records
- All demo users use password `password123`

### What the Seed Function Generates

| Entity | Count | Details |
|--------|-------|---------|
| Departments | 6 | General Medicine, Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology |
| Doctor Profiles | 5 | With specializations, bios, departments |
| Patient Profiles | 10 | With DOB, address, phone |
| Doctor Schedules | 25 | Mon-Fri, 9am-5pm for each doctor |
| Appointments | 180 | Spread across -90 to +30 days from today |
| Medical Records | ~60 | For 60% of completed appointments |

### Idempotent Design

The seed function deletes existing data for the given users before inserting:

```sql
DELETE FROM public.medical_records WHERE doctor_id = ANY(doctor_uids) OR patient_id = ANY(patient_uids);
DELETE FROM public.appointments WHERE doctor_id = ANY(doctor_uids) OR patient_id = ANY(patient_uids);
DELETE FROM public.doctor_schedules WHERE doctor_id = ANY(doctor_uids);
```

Deletion order respects foreign key constraints.

---

## 18. Gotchas & Lessons Learned

### 1. PostgREST Foreign Key Joins Don't Work Through auth.users

**The problem:** The `appointments` table has FKs like `patient_id → auth.users(id)`. When writing Supabase queries like:
```typescript
.select("*, doctor:profiles!appointments_doctor_id_fkey(full_name)")
```
PostgREST can't resolve this join because the FK `appointments_doctor_id_fkey` points to `auth.users`, not to `profiles`. The joined data comes back as `null`.

**The fix:** Add direct FKs from `appointments` to `profiles(user_id)` (which has a UNIQUE constraint):
```sql
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_doctor_profile_fkey
  FOREIGN KEY (doctor_id) REFERENCES public.profiles(user_id);
```

Then update query hints to use the new FK name:
```typescript
.select("*, doctor:profiles!appointments_doctor_profile_fkey(full_name)")
```

**Lesson:** When using Supabase PostgREST joins with FK hints, the FK must point directly to the table you're joining. Indirect relationships through a third table don't work with the `!fkey_name` hint syntax.

### 2. Department Admin Policies Must Come After Profiles Table

**The problem:** The initial migration had department admin policies (which check `profiles.role = 'admin'`) defined right after the `departments` table, before the `profiles` table was created. This caused:
```
ERROR: relation "public.profiles" does not exist
```

**The fix:** Move department admin policies (insert, update, delete) to after the `profiles` table and trigger definitions.

**Lesson:** In a single migration file, policy definitions that reference other tables must come after those tables are created. PostgreSQL executes the statements sequentially.

### 3. Supabase Confirmation Email Redirects to localhost

**The problem:** After deploying to Vercel, clicking the signup confirmation email redirected to `http://localhost:3000/auth/callback` instead of the production URL.

**The fix:** Two changes:
1. Set `emailRedirectTo: window.location.origin + '/auth/callback'` in the signup call
2. Update the **Site URL** in Supabase Dashboard → Authentication → URL Configuration to the Vercel domain

**Lesson:** Supabase uses the Site URL as the base for auth emails. The `emailRedirectTo` option in `signUp()` overrides this per-call but must be an allowed redirect URL.

### 4. Direct auth.users Inserts Need auth.identities

**The problem:** Seeding demo users by inserting directly into `auth.users` created user rows, but those users couldn't log in.

**The fix:** Also insert into `auth.identities` for each user:
```sql
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (user_uuid, user_uuid, user_uuid, jsonb_build_object('sub', user_uuid::text, 'email', email), 'email', now(), now(), now());
```

**Lesson:** Supabase Auth requires both an `auth.users` row and an `auth.identities` row for email/password login to work. The signup API creates both automatically, but direct SQL inserts must handle both.

### 5. TypeScript null vs undefined in Component Props

**The problem:** Database fields return `null` but some component props expect `string | undefined`. For example, `appointment.reason` is `string | null` but the VideoConsultation's `reason` prop expects `string | undefined`.

**The fix:** Use `|| undefined` to convert:
```typescript
reason: activeAppointment.reason || undefined
```

**Lesson:** Supabase returns `null` for empty database fields, but React/TypeScript idioms often use `undefined` for optional props. Be explicit about the conversion.

---

## 19. Things to Improve

### Real-Time Features
- **Live appointment status updates:** Use Supabase Realtime to subscribe to appointment changes, so doctors see new bookings without refreshing.
- **Real video calls:** Replace mock UI with WebRTC via Daily.co or Twilio. The component architecture is already in place.

### Booking Flow Enhancements
- **Time slot conflict detection:** Currently, multiple patients can book the same doctor at the same time. Add a database constraint or check before inserting.
- **Time slot generation from schedule:** Currently uses a fixed grid of time slots. Should dynamically generate slots based on the doctor's actual start/end times.
- **Appointment cancellation window:** Add a policy that prevents cancellation within X hours of the appointment.

### Data & Queries
- **Server-side pagination:** Appointment lists currently fetch all records. For a production system with thousands of appointments, use `.range()` for pagination.
- **Search functionality:** Admin users/appointments pages could benefit from server-side search using `.ilike()` instead of client-side `.filter()`.
- **Optimistic updates:** Status changes (confirm, start, complete) currently refetch the full list. Use optimistic state updates for instant UI feedback.

### Security
- **Admin role protection:** Currently, the admin role can only be set via direct database access or the seed script. Consider adding an invite-based admin flow.
- **Rate limiting:** No rate limiting on appointment creation. A malicious user could flood the system with bookings.
- **Input sanitization:** Text inputs (reason, notes, diagnosis) should be sanitized for XSS if rendered as HTML anywhere.

### UX Polish
- **Form validation:** Most forms rely on HTML `required` attributes. Add client-side validation with error messages (e.g., password strength, valid date selection).
- **Confirmation dialogs:** Status changes (complete, no-show) should have confirmation modals to prevent accidental clicks.
- **Notification system:** Toast notifications for successful actions (booked, cancelled, record created) instead of page redirects.
- **Email notifications:** Send confirmation emails when appointments are booked, cancelled, or upcoming (reminder).

### Performance
- **Image optimization:** Avatar images from Supabase Storage could use Next.js `<Image>` with width/height for automatic optimization.
- **Bundle size:** Consider code splitting for role-specific pages — patients shouldn't download doctor components.
- **Caching:** Departments and doctor profiles rarely change and could be cached with SWR or React Query.

---

## 20. Key Engineering Decisions

### Why Redux Toolkit Instead of Just Hooks?

ecom-dash uses only React hooks because each page fetches its own data independently. HealthConnect uses Redux because:

| Concern | Hooks Only | Redux Toolkit |
|---------|-----------|---------------|
| Auth state across pages | Re-fetch on every page | Set once, read everywhere |
| Sidebar role awareness | Pass as prop or context | `useAppSelector(state => state.auth.role)` |
| Appointment refresh after action | Callback prop drilling | Dispatch from any component |
| Loading states | Per-component useState | Centralized per-slice |

The tradeoff is more boilerplate (3 slice files, provider wrapper, typed hooks). For 3 slices of state, this is manageable.

### Why Client-Side Rendering for All Dashboard Pages?

Every dashboard page is `"use client"`. This means no Server Component data fetching. The reasons:

1. **Auth dependency:** Every page needs `userId` from the Supabase session, which requires cookies in the request context. While Server Components can access cookies, the auth flow also syncs to Redux, which is client-side.
2. **Interactive data:** Nearly every page has forms, filters, tabs, or action buttons that require client-side state.
3. **Supabase query builder:** The PostgREST join syntax (`.select("*, doctor:profiles!fkey(...)`)`) works naturally in client components.

For a production app, you might use Server Components for initial data fetch and pass it to Client Components as props. For this project's scope, the all-client approach is simpler and sufficient.

### Why Role in user_metadata Instead of a Database Query?

The middleware reads `user.user_metadata.role` to determine which dashboard to redirect to. An alternative would be querying the `profiles` table for the role. The tradeoff:

| Approach | Pros | Cons |
|----------|------|------|
| user_metadata (current) | No DB query in middleware, fast | Could be stale if role changes |
| Database query | Always current | Extra DB round-trip on every request |

Since role changes are rare (only admins would change a user's role), the metadata approach is preferred. If a role change happens, the user just needs to re-login.

### Why Separate Routes per Role Instead of Conditional Rendering?

An alternative architecture would be a single `/dashboard` with conditional rendering based on role. The separate routes approach (`/dashboard/patient`, `/dashboard/doctor`, `/dashboard/admin`) was chosen because:

1. **Clear URL semantics:** The URL tells you what role's view you're looking at
2. **Middleware enforcement:** The role path segment makes it trivial to check access rights
3. **Code splitting:** Each role's pages are separate files that can be independently loaded
4. **No conditional rendering bugs:** No risk of accidentally showing doctor features to a patient due to a rendering race condition

### Why Mock Video Instead of Real WebRTC?

Building real video calls would require:
- A WebRTC signaling server (or a service like Daily.co/Twilio)
- TURN/STUN server configuration
- Media device permissions handling
- Connection state management
- Bandwidth adaptation

This is a significant feature that would dominate the project's complexity. The mock UI demonstrates the frontend architecture (layout, controls, chat, participant info) without the backend infrastructure. The component is designed so that replacing the mock video area with a real `<video>` element would require minimal changes to the surrounding UI.
