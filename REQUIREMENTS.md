# HealthConnect — Requirements Document

## Project Overview

HealthConnect is a healthcare appointment scheduling and telemedicine platform for medical practices. It provides role-based dashboards for patients, doctors, and administrators, enabling appointment booking, schedule management, medical records, and video consultations.

This is a portfolio project built by nanushi demonstrating production-quality full-stack development with role-based access control.

---

## Functional Requirements

### FR-01: Authentication & Authorization

| ID | Requirement | Priority |
|----|------------|----------|
| FR-01.1 | Users can sign up with email, password, full name, and role selection (Patient/Doctor) | Must |
| FR-01.2 | Users can sign in with email and password | Must |
| FR-01.3 | Authenticated users are redirected to their role-specific dashboard | Must |
| FR-01.4 | Unauthenticated users are redirected to login when accessing protected routes | Must |
| FR-01.5 | Users cannot access dashboards of other roles | Must |
| FR-01.6 | Admin accounts are created manually (not via public signup) | Must |
| FR-01.7 | Users can sign out from any dashboard page | Must |

### FR-02: Patient Dashboard

| ID | Requirement | Priority |
|----|------------|----------|
| FR-02.1 | Patients see an overview with upcoming appointments and recent records | Must |
| FR-02.2 | Patients can book appointments by selecting department, doctor, date, and time | Must |
| FR-02.3 | Available time slots are based on doctor schedules | Must |
| FR-02.4 | Patients can view their appointment history with status filters | Must |
| FR-02.5 | Patients can cancel upcoming appointments | Must |
| FR-02.6 | Patients can view their medical records chronologically | Must |
| FR-02.7 | Patients can access mock video consultation UI | Must |
| FR-02.8 | Patients can edit their profile (name, phone, DOB, address, avatar) | Must |

### FR-03: Doctor Dashboard

| ID | Requirement | Priority |
|----|------------|----------|
| FR-03.1 | Doctors see an overview with today's appointments and KPIs | Must |
| FR-03.2 | Doctors can manage their weekly availability schedule | Must |
| FR-03.3 | Doctors can view and manage assigned appointments (confirm, start, complete, no-show) | Must |
| FR-03.4 | Doctors can view patient records for patients they've treated | Must |
| FR-03.5 | Doctors can add new medical records (diagnosis, prescription, notes) | Must |
| FR-03.6 | Doctors can access mock video consultation UI | Must |
| FR-03.7 | Doctors can edit their profile (name, phone, specialization, bio, avatar) | Must |

### FR-04: Admin Dashboard

| ID | Requirement | Priority |
|----|------------|----------|
| FR-04.1 | Admins see system-wide statistics (total users, appointments, etc.) | Must |
| FR-04.2 | Admins can view and search all users with role filters | Must |
| FR-04.3 | Admins can manage departments (add, edit, delete) | Must |
| FR-04.4 | Admins can view all appointments across the system | Must |
| FR-04.5 | Admins can edit their own profile | Must |

### FR-05: Landing Page

| ID | Requirement | Priority |
|----|------------|----------|
| FR-05.1 | Public landing page with hero section and illustrations | Must |
| FR-05.2 | Features section highlighting key capabilities | Must |
| FR-05.3 | Technology stack display | Must |
| FR-05.4 | Call-to-action buttons for sign up and sign in | Must |
| FR-05.5 | Dark mode toggle accessible from landing page | Must |

### FR-06: Video Consultation (Mock)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-06.1 | Mock video call UI with placeholder video areas | Must |
| FR-06.2 | Visual-only controls (mic, camera, screen share, end call) | Must |
| FR-06.3 | Control buttons toggle visual states (muted icon, etc.) | Must |
| FR-06.4 | Side panel with appointment details and chat area | Should |
| FR-06.5 | Clear "demo" indicator that this is a mock UI | Must |

### FR-07: Theme

| ID | Requirement | Priority |
|----|------------|----------|
| FR-07.1 | Dark/light mode toggle on all pages | Must |
| FR-07.2 | Theme persists across sessions via localStorage | Must |
| FR-07.3 | No flash of wrong theme on page load | Must |

---

## Non-Functional Requirements

| ID | Requirement | Category |
|----|------------|----------|
| NFR-01 | All pages must be responsive (mobile, tablet, desktop) | Usability |
| NFR-02 | TypeScript strict mode with no `any` types | Code Quality |
| NFR-03 | Row-level security on all database tables | Security |
| NFR-04 | Role-based access enforced at middleware and database levels | Security |
| NFR-05 | Page load time under 3 seconds on standard connection | Performance |
| NFR-06 | Modular, structured codebase with clear separation of concerns | Maintainability |
| NFR-07 | Reusable UI component library | Maintainability |
| NFR-08 | Redux Toolkit for global state management | Architecture |
| NFR-09 | Supabase Storage for avatar image uploads | Infrastructure |
| NFR-10 | Production deployment on Vercel | Infrastructure |
| NFR-11 | Seed data for demo purposes | Testability |
| NFR-12 | Comprehensive project documentation | Documentation |

---

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15+ | React framework with App Router |
| Redux Toolkit | Global state management |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling with custom theme |
| Supabase | PostgreSQL, Auth, RLS, Storage |
| @supabase/ssr | Cookie-based session management |
| Vercel | Hosting and deployment |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| departments | Medical departments (Cardiology, Dermatology, etc.) |
| profiles | User profiles extending auth.users (role, avatar, contact info) |
| doctor_schedules | Weekly availability for each doctor |
| appointments | Patient-doctor appointments with status tracking |
| medical_records | Diagnosis, prescription, and notes per visit |

---

## User Roles

| Role | Access |
|------|--------|
| Patient | Book appointments, view own records, profile management |
| Doctor | Manage schedule, handle appointments, create medical records |
| Admin | System-wide visibility, user management, department management |

---

## Future Enhancements

- [ ] Real WebRTC video consultation (replace mock UI)
- [ ] Email/SMS appointment reminders
- [ ] Push notifications
- [ ] Prescription PDF generation
- [ ] Patient document uploads
- [ ] Analytics dashboard for admin
- [ ] Multi-language support
