# HealthConnect - Technical Documentation

## Architecture Overview

HealthConnect is a Next.js 15 application using the App Router pattern. It follows a role-based architecture with three user types: Patient, Doctor, and Admin. Each role has its own dashboard section with dedicated pages and features.

### Core Architecture Decisions

1. **App Router (not Pages Router)** - Leverages React Server Components, nested layouts, and route groups
2. **Client-side rendering for dashboards** - All dashboard pages are `"use client"` for real-time interactivity
3. **Supabase SSR** - Cookie-based authentication via `@supabase/ssr` for secure session handling
4. **Redux Toolkit** - Global state for auth, UI, and appointments (client-side)
5. **Tailwind CSS 4** - New `@theme inline` syntax with custom brand palette

---

## Authentication Flow

### Signup
1. User fills signup form (email, password, full name, role)
2. `supabase.auth.signUp()` called with `role` in `user_metadata`
3. Database trigger `handle_new_user()` auto-creates a `profiles` row
4. User redirected to `/dashboard/{role}`

### Login
1. User enters email/password
2. `supabase.auth.signInWithPassword()` called
3. Role read from `user.user_metadata.role`
4. Redirect to `/dashboard/{role}`

### Middleware Protection
- `src/middleware.ts` runs on every `/dashboard/*`, `/login`, `/signup` request
- Calls `updateSession()` from `src/lib/supabase/middleware.ts`
- Logic:
  - Unauthenticated users on `/dashboard/*` → redirect to `/login`
  - Authenticated users on `/login` or `/signup` → redirect to `/dashboard/{role}`
  - Cross-role access (e.g., patient accessing `/dashboard/doctor`) → redirect to own dashboard

### Session Refresh
- Supabase SSR automatically refreshes tokens via cookies
- No manual token management required

---

## Database Schema

### Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid (PK, FK) | References auth.users |
| role | text | patient, doctor, admin |
| full_name | text | Display name |
| avatar_url | text | Supabase Storage URL |
| phone | text | Contact number |
| date_of_birth | date | Patient DOB |
| address | text | Full address |
| department_id | uuid (FK) | Doctor's department |
| specialization | text | Doctor's specialty |
| bio | text | Professional bio |
| created_at | timestamptz | Auto-generated |

#### `departments`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| name | text | Department name |
| description | text | Brief description |
| icon | text | Emoji icon |

#### `doctor_schedules`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| doctor_id | uuid (FK) | References profiles |
| day_of_week | int | 0 (Sun) - 6 (Sat) |
| start_time | time | Shift start |
| end_time | time | Shift end |
| is_available | boolean | Availability flag |

#### `appointments`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| patient_id | uuid (FK) | References profiles |
| doctor_id | uuid (FK) | References profiles |
| department_id | uuid (FK) | References departments |
| appointment_date | date | Appointment date |
| start_time | time | Start time |
| end_time | time | End time |
| status | text | scheduled/confirmed/in_progress/completed/cancelled/no_show |
| type | text | in_person/video |
| reason | text | Visit reason |
| notes | text | Doctor notes |
| created_at | timestamptz | Auto-generated |

#### `medical_records`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| patient_id | uuid (FK) | References profiles |
| doctor_id | uuid (FK) | References profiles |
| diagnosis | text | Primary diagnosis |
| prescription | text | Medications |
| notes | text | Additional notes |
| created_at | timestamptz | Auto-generated |

### Row Level Security (RLS)

All tables have RLS enabled:

- **Patients** can read their own profiles, appointments, and medical records
- **Doctors** can read/write appointments and records for their patients, manage their own schedule
- **Admins** have full read/write access to all tables
- **Departments** are readable by all authenticated users

---

## Component Architecture

### UI Components (`src/components/ui/`)

| Component | Props | Description |
|-----------|-------|-------------|
| Button | variant, size, loading, disabled | Primary action button with loading spinner |
| Card | className | Container with CardHeader and CardContent |
| Badge | status | Colored status indicator |
| Input | label, error, id | Form input with label |
| Select | label, options | Dropdown select |
| Modal | isOpen, onClose, title | Dialog overlay |
| Avatar | src, name, size | Profile image with initials fallback |
| EmptyState | title, description | Empty list placeholder |

### Layout Components (`src/components/layout/`)

- **Sidebar** - Role-aware navigation sidebar (hidden on mobile)
- **MobileSidebar** - Drawer sidebar for mobile with backdrop
- **DashboardHeader** - Page title, subtitle, and action buttons

### Shared Components (`src/components/shared/`)

- **AppointmentCard** - Reusable appointment display with role-specific actions
- **VideoConsultation** - Mock video call UI with controls and chat

---

## State Management

### Redux Slices

1. **auth** - `userId`, `role`, `fullName`, `avatarUrl`, `loading`
2. **ui** - `sidebarOpen`, `activeModal`
3. **appointments** - `list`, `selected`, `statusFilter`, `loading`

### Custom Hooks

- `useAuth()` - Syncs Supabase session to Redux, returns auth state
- `useTheme()` - Dark mode toggle with localStorage persistence
- `useAppDispatch()` / `useAppSelector()` - Typed Redux hooks

---

## Dark Mode

Implementation:
1. Inline `<script>` in `layout.tsx` reads `localStorage` before render (prevents flash)
2. `useTheme()` hook manages theme state and toggles `dark` class on `<html>`
3. Tailwind's `@custom-variant dark (&:where(.dark, .dark *))` enables `dark:` utilities
4. Key: `healthcare-app-theme` in localStorage

---

## Appointment Booking Flow (Patient)

1. **Select Department** - Grid of department cards
2. **Select Doctor** - Shows available doctors in chosen department
3. **Select Date & Time** - Calendar date picker + time slot grid (checks doctor schedule)
4. **Confirm** - Review and submit appointment

---

## Video Consultation (Mock)

The video consultation component (`VideoConsultation.tsx`) provides:
- Simulated remote video view with participant avatar
- Self-view picture-in-picture box
- Control bar: mic, camera, screen share, chat toggle, end call
- Side panel: appointment details, text chat, consultation notes (doctor only)
- Demo banner explaining this is a mock UI

**Future Enhancement:** Replace with WebRTC (via Daily.co, Twilio, or Agora) for real video calls.

---

## Deployment

### Vercel
1. Connect GitHub repo to Vercel
2. Set environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. Deploy (automatic on push to main)

### Supabase Production
1. Run `001_initial_schema.sql` in SQL editor
2. Run `seed.sql` for initial departments
3. Enable email auth in Auth settings
4. Create `avatars` storage bucket (public)
5. Configure site URL in Auth settings to match Vercel domain
