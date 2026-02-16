-- ============================================================
-- HealthConnect: Initial database schema
-- 5 tables: departments, profiles, doctor_schedules, appointments, medical_records
-- All with RLS policies for role-based access
-- ============================================================

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  created_at timestamptz default now() not null
);

alter table public.departments enable row level security;

create policy "Authenticated users can view departments"
  on public.departments for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert departments"
  on public.departments for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admin can update departments"
  on public.departments for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admin can delete departments"
  on public.departments for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- ============================================================
-- 2. PROFILES (extends auth.users)
-- ============================================================

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'admin')),
  full_name text,
  avatar_url text,
  phone text,
  date_of_birth date,
  address text,
  department_id uuid references public.departments(id),
  specialization text,
  bio text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Authenticated users can view all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Admin can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles as p
      where p.user_id = auth.uid()
      and p.role = 'admin'
    )
  );

create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_department_id on public.profiles(department_id);

-- Auto-create profile on user signup
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 3. DOCTOR SCHEDULES
-- ============================================================

create table public.doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references auth.users(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean default true not null,
  created_at timestamptz default now() not null,
  unique(doctor_id, day_of_week)
);

alter table public.doctor_schedules enable row level security;

create policy "Authenticated users can view schedules"
  on public.doctor_schedules for select
  using (auth.role() = 'authenticated');

create policy "Doctors can insert own schedule"
  on public.doctor_schedules for insert
  with check (auth.uid() = doctor_id);

create policy "Doctors can update own schedule"
  on public.doctor_schedules for update
  using (auth.uid() = doctor_id);

create policy "Doctors can delete own schedule"
  on public.doctor_schedules for delete
  using (auth.uid() = doctor_id);

create index idx_doctor_schedules_doctor_id on public.doctor_schedules(doctor_id);

-- ============================================================
-- 4. APPOINTMENTS
-- ============================================================

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade not null,
  doctor_id uuid references auth.users(id) on delete cascade not null,
  department_id uuid references public.departments(id) not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  type text not null default 'in_person'
    check (type in ('in_person', 'video')),
  reason text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.appointments enable row level security;

-- Patients see own appointments
create policy "Patients can view own appointments"
  on public.appointments for select
  using (auth.uid() = patient_id);

-- Doctors see assigned appointments
create policy "Doctors can view assigned appointments"
  on public.appointments for select
  using (auth.uid() = doctor_id);

-- Admin sees all appointments
create policy "Admin can view all appointments"
  on public.appointments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Patients can create appointments
create policy "Patients can create appointments"
  on public.appointments for insert
  with check (auth.uid() = patient_id);

-- Patients can update own appointments (cancel)
create policy "Patients can update own appointments"
  on public.appointments for update
  using (auth.uid() = patient_id);

-- Doctors can update assigned appointments (confirm, complete, etc.)
create policy "Doctors can update assigned appointments"
  on public.appointments for update
  using (auth.uid() = doctor_id);

-- Admin can update any appointment
create policy "Admin can update any appointment"
  on public.appointments for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create index idx_appointments_patient_id on public.appointments(patient_id);
create index idx_appointments_doctor_id on public.appointments(doctor_id);
create index idx_appointments_date on public.appointments(appointment_date);
create index idx_appointments_status on public.appointments(status);
create index idx_appointments_department_id on public.appointments(department_id);

-- ============================================================
-- 5. MEDICAL RECORDS
-- ============================================================

create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade not null,
  doctor_id uuid references auth.users(id) on delete cascade not null,
  appointment_id uuid references public.appointments(id),
  diagnosis text not null,
  prescription text,
  notes text,
  created_at timestamptz default now() not null
);

alter table public.medical_records enable row level security;

-- Patients see own records
create policy "Patients can view own records"
  on public.medical_records for select
  using (auth.uid() = patient_id);

-- Doctors see records they created
create policy "Doctors can view their records"
  on public.medical_records for select
  using (auth.uid() = doctor_id);

-- Doctors can create records
create policy "Doctors can create records"
  on public.medical_records for insert
  with check (auth.uid() = doctor_id);

-- Admin sees all records
create policy "Admin can view all records"
  on public.medical_records for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create index idx_medical_records_patient_id on public.medical_records(patient_id);
create index idx_medical_records_doctor_id on public.medical_records(doctor_id);
create index idx_medical_records_appointment_id on public.medical_records(appointment_id);
