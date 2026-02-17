-- ============================================================
-- Add direct foreign keys from appointments and medical_records
-- to profiles(user_id) so PostgREST can resolve joins.
--
-- The existing FKs to auth.users(id) remain intact.
-- These additional FKs let Supabase PostgREST join on profiles
-- using hint syntax like: profiles!appointments_patient_profile_fkey
-- ============================================================

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_patient_profile_fkey
  FOREIGN KEY (patient_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_doctor_profile_fkey
  FOREIGN KEY (doctor_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.medical_records
  ADD CONSTRAINT medical_records_patient_profile_fkey
  FOREIGN KEY (patient_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.medical_records
  ADD CONSTRAINT medical_records_doctor_profile_fkey
  FOREIGN KEY (doctor_id) REFERENCES public.profiles(user_id);

-- Also add FKs for doctor_schedules -> profiles
ALTER TABLE public.doctor_schedules
  ADD CONSTRAINT doctor_schedules_doctor_profile_fkey
  FOREIGN KEY (doctor_id) REFERENCES public.profiles(user_id);
