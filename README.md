# HealthConnect - Healthcare Appointment System

A full-stack healthcare appointment management system built with Next.js 15, Supabase, and Tailwind CSS. Features role-based dashboards for patients, doctors, and administrators.

## Features

- **Patient Portal** - Book appointments, view medical records, manage profile
- **Doctor Dashboard** - Manage schedule, handle appointments, create medical records
- **Admin Panel** - User management, department management, system overview
- **Video Consultation** - Mock video consultation UI (WebRTC-ready architecture)
- **Dark Mode** - System-wide light/dark theme toggle
- **Responsive** - Mobile-first design with adaptive layouts

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Auth:** Supabase Auth with SSR cookie-based sessions
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/chyashp/healthcare-app.git
   cd healthcare-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run the migration in your Supabase SQL editor:
   - `supabase/migrations/001_initial_schema.sql` - Creates tables, RLS policies, and triggers
   - `supabase/seed.sql` - Seeds departments and sample data

5. **Create a Supabase Storage bucket**

   Create a public bucket named `avatars` in your Supabase dashboard for profile photo uploads.

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

After running the seed data, sign up with the following roles to test:

- **Patient** - Sign up with role "Patient"
- **Doctor** - Sign up with role "Doctor"
- **Admin** - Set role to "admin" in the profiles table manually

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & signup pages
│   ├── auth/            # OAuth callback route
│   └── dashboard/
│       ├── patient/     # Patient pages (overview, book, appointments, records, consultation, settings)
│       ├── doctor/      # Doctor pages (overview, schedule, appointments, records, consultation, settings)
│       └── admin/       # Admin pages (overview, users, departments, appointments, settings)
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Badge, Modal, etc.)
│   ├── layout/          # Sidebar, MobileSidebar, DashboardHeader
│   ├── landing/         # Hero, Features
│   └── shared/          # AppointmentCard, VideoConsultation
├── store/               # Redux Toolkit store and slices
├── hooks/               # Custom hooks (useAuth, useTheme, useRedux)
├── lib/                 # Utilities and Supabase clients
└── types/               # TypeScript type definitions
```

## Database Schema

- **profiles** - User profiles with role (patient/doctor/admin), avatar, contact info
- **departments** - Hospital departments (Cardiology, Neurology, etc.)
- **doctor_schedules** - Weekly availability per doctor
- **appointments** - Patient-doctor appointments with status tracking
- **medical_records** - Diagnosis, prescriptions, and notes

All tables use Row Level Security (RLS) for data isolation between roles.

## License

MIT
