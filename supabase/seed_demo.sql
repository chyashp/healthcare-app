-- ============================================================
-- HealthConnect: Demo Seed Data
-- Run this in the Supabase SQL Editor
--
-- Existing users:
--   Doctor: 4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59
--   Patient: e054f814-15b4-4fab-b4b0-b1e04a331bce
--
-- New users created by this script (password: password123):
--   doctor2@healthconnect.demo
--   doctor3@healthconnect.demo
--   doctor4@healthconnect.demo
--   patient2@healthconnect.demo
--   patient3@healthconnect.demo
--   patient4@healthconnect.demo
--   patient5@healthconnect.demo
--   admin@healthconnect.demo
-- ============================================================

-- 1. Insert departments
INSERT INTO public.departments (name, description, icon) VALUES
  ('General Medicine', 'Primary care and general health consultations', 'stethoscope'),
  ('Cardiology', 'Heart and cardiovascular system specialists', 'heart'),
  ('Dermatology', 'Skin, hair, and nail care specialists', 'shield'),
  ('Orthopedics', 'Bone, joint, and muscle specialists', 'bone'),
  ('Pediatrics', 'Healthcare for infants, children, and adolescents', 'baby'),
  ('Neurology', 'Brain and nervous system specialists', 'brain')
ON CONFLICT (name) DO NOTHING;

-- 2. Create new auth users (password: password123 for all)
-- The trigger handle_new_user() will auto-create profiles

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  aud, role
) VALUES
  -- Doctors
  ('aaaaaaaa-1111-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'doctor2@healthconnect.demo', crypt('password123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"doctor","full_name":"Dr. James Wilson"}',
   'authenticated', 'authenticated'),

  ('aaaaaaaa-1111-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'doctor3@healthconnect.demo', crypt('password123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"doctor","full_name":"Dr. Maria Garcia"}',
   'authenticated', 'authenticated'),

  ('aaaaaaaa-1111-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'doctor4@healthconnect.demo', crypt('password123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"doctor","full_name":"Dr. Robert Kim"}',
   'authenticated', 'authenticated'),

  -- Patients
  ('bbbbbbbb-2222-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'patient2@healthconnect.demo', crypt('password123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"patient","full_name":"Alice Thompson"}',
   'authenticated', 'authenticated'),

  ('bbbbbbbb-2222-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'patient3@healthconnect.demo', crypt('password123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"patient","full_name":"Bob Martinez"}',
   'authenticated', 'authenticated'),

  ('bbbbbbbb-2222-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'patient4@healthconnect.demo', crypt('password123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"patient","full_name":"Carol Davis"}',
   'authenticated', 'authenticated'),

  ('bbbbbbbb-2222-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000',
   'patient5@healthconnect.demo', crypt('password123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"patient","full_name":"David Lee"}',
   'authenticated', 'authenticated'),

  -- Admin
  ('cccccccc-3333-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'admin@healthconnect.demo', crypt('password123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"role":"admin","full_name":"System Administrator"}',
   'authenticated', 'authenticated')

ON CONFLICT (id) DO NOTHING;

-- Also need identities for each user (required by Supabase Auth)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'aaaaaaaa-1111-4000-8000-000000000001', 'doctor2@healthconnect.demo',
   '{"sub":"aaaaaaaa-1111-4000-8000-000000000001","email":"doctor2@healthconnect.demo"}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'aaaaaaaa-1111-4000-8000-000000000002', 'doctor3@healthconnect.demo',
   '{"sub":"aaaaaaaa-1111-4000-8000-000000000002","email":"doctor3@healthconnect.demo"}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'aaaaaaaa-1111-4000-8000-000000000003', 'doctor4@healthconnect.demo',
   '{"sub":"aaaaaaaa-1111-4000-8000-000000000003","email":"doctor4@healthconnect.demo"}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'bbbbbbbb-2222-4000-8000-000000000001', 'patient2@healthconnect.demo',
   '{"sub":"bbbbbbbb-2222-4000-8000-000000000001","email":"patient2@healthconnect.demo"}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'bbbbbbbb-2222-4000-8000-000000000002', 'patient3@healthconnect.demo',
   '{"sub":"bbbbbbbb-2222-4000-8000-000000000002","email":"patient3@healthconnect.demo"}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'bbbbbbbb-2222-4000-8000-000000000003', 'patient4@healthconnect.demo',
   '{"sub":"bbbbbbbb-2222-4000-8000-000000000003","email":"patient4@healthconnect.demo"}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'bbbbbbbb-2222-4000-8000-000000000004', 'patient5@healthconnect.demo',
   '{"sub":"bbbbbbbb-2222-4000-8000-000000000004","email":"patient5@healthconnect.demo"}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'cccccccc-3333-4000-8000-000000000001', 'admin@healthconnect.demo',
   '{"sub":"cccccccc-3333-4000-8000-000000000001","email":"admin@healthconnect.demo"}', 'email', now(), now(), now())
ON CONFLICT DO NOTHING;

-- 3. Update existing user profiles
UPDATE public.profiles SET
  full_name = 'Dr. Sarah Chen',
  phone = '555-100-0001',
  department_id = (SELECT id FROM public.departments WHERE name = 'General Medicine'),
  specialization = 'Internal Medicine',
  bio = 'Board-certified physician with over 15 years of clinical experience. Passionate about preventive medicine and patient-centered care.'
WHERE user_id = '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59';

UPDATE public.profiles SET
  full_name = COALESCE(NULLIF(full_name, ''), 'Demo Patient'),
  phone = '555-200-0001',
  date_of_birth = '1992-05-14',
  address = '123 Main Street, Springfield, IL 62701'
WHERE user_id = 'e054f814-15b4-4fab-b4b0-b1e04a331bce';

-- 4. Update new doctor profiles with departments, specializations, bios
UPDATE public.profiles SET
  phone = '555-100-0002',
  department_id = (SELECT id FROM public.departments WHERE name = 'Cardiology'),
  specialization = 'Interventional Cardiology',
  bio = 'Dedicated cardiologist with extensive research in minimally invasive cardiac procedures. Fellow of the American College of Cardiology.'
WHERE user_id = 'aaaaaaaa-1111-4000-8000-000000000001';

UPDATE public.profiles SET
  phone = '555-100-0003',
  department_id = (SELECT id FROM public.departments WHERE name = 'Dermatology'),
  specialization = 'Cosmetic Dermatology',
  bio = 'Award-winning dermatologist specializing in both medical and cosmetic dermatology. Published researcher in skin cancer prevention.'
WHERE user_id = 'aaaaaaaa-1111-4000-8000-000000000002';

UPDATE public.profiles SET
  phone = '555-100-0004',
  department_id = (SELECT id FROM public.departments WHERE name = 'Orthopedics'),
  specialization = 'Sports Medicine',
  bio = 'Orthopedic surgeon specializing in sports injuries and joint reconstruction. Team physician for local college athletics.'
WHERE user_id = 'aaaaaaaa-1111-4000-8000-000000000003';

-- 5. Update new patient profiles
UPDATE public.profiles SET
  phone = '555-200-0002', date_of_birth = '1985-03-22',
  address = '456 Oak Avenue, Portland, OR 97201'
WHERE user_id = 'bbbbbbbb-2222-4000-8000-000000000001';

UPDATE public.profiles SET
  phone = '555-200-0003', date_of_birth = '1978-11-08',
  address = '789 Pine Road, Austin, TX 73301'
WHERE user_id = 'bbbbbbbb-2222-4000-8000-000000000002';

UPDATE public.profiles SET
  phone = '555-200-0004', date_of_birth = '1995-07-19',
  address = '321 Elm Street, Denver, CO 80201'
WHERE user_id = 'bbbbbbbb-2222-4000-8000-000000000003';

UPDATE public.profiles SET
  phone = '555-200-0005', date_of_birth = '1990-01-30',
  address = '654 Maple Drive, Seattle, WA 98101'
WHERE user_id = 'bbbbbbbb-2222-4000-8000-000000000004';

-- Update admin profile
UPDATE public.profiles SET
  phone = '555-000-0001'
WHERE user_id = 'cccccccc-3333-4000-8000-000000000001';

-- 6. Doctor schedules for ALL doctors (Mon-Fri, 9am-5pm)
DELETE FROM public.doctor_schedules WHERE doctor_id IN (
  '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59',
  'aaaaaaaa-1111-4000-8000-000000000001',
  'aaaaaaaa-1111-4000-8000-000000000002',
  'aaaaaaaa-1111-4000-8000-000000000003'
);

INSERT INTO public.doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available)
SELECT doc_id, day, '09:00'::time, '17:00'::time, true
FROM unnest(ARRAY[
  '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59'::uuid,
  'aaaaaaaa-1111-4000-8000-000000000001'::uuid,
  'aaaaaaaa-1111-4000-8000-000000000002'::uuid,
  'aaaaaaaa-1111-4000-8000-000000000003'::uuid
]) AS doc_id
CROSS JOIN generate_series(1, 5) AS day;

-- 7. Clean existing appointments/records
DELETE FROM public.medical_records WHERE doctor_id IN (
  '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59',
  'aaaaaaaa-1111-4000-8000-000000000001',
  'aaaaaaaa-1111-4000-8000-000000000002',
  'aaaaaaaa-1111-4000-8000-000000000003'
);
DELETE FROM public.appointments WHERE doctor_id IN (
  '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59',
  'aaaaaaaa-1111-4000-8000-000000000001',
  'aaaaaaaa-1111-4000-8000-000000000002',
  'aaaaaaaa-1111-4000-8000-000000000003'
);

-- 8. Appointments across all doctors and patients
-- Dr. Sarah Chen (General Medicine) - your existing doctor
INSERT INTO public.appointments (patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, type, reason) VALUES
  -- Past
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 45, '09:00', '09:30', 'completed', 'in_person', 'Annual checkup'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 30, '10:00', '10:30', 'completed', 'in_person', 'Follow-up visit'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 21, '14:00', '14:30', 'completed', 'video', 'Test results review'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 14, '11:00', '11:30', 'completed', 'in_person', 'Chronic condition management'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 7, '09:30', '10:00', 'completed', 'in_person', 'Prescription renewal'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 3, '15:00', '15:30', 'cancelled', 'video', 'Follow-up consultation'),
  ('bbbbbbbb-2222-4000-8000-000000000001', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 40, '10:00', '10:30', 'completed', 'in_person', 'New patient intake'),
  ('bbbbbbbb-2222-4000-8000-000000000001', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 20, '13:00', '13:30', 'completed', 'video', 'Lab results discussion'),
  ('bbbbbbbb-2222-4000-8000-000000000002', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 35, '11:00', '11:30', 'completed', 'in_person', 'Physical examination'),
  ('bbbbbbbb-2222-4000-8000-000000000003', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 10, '09:00', '09:30', 'completed', 'in_person', 'Flu symptoms'),
  -- Today
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date, '09:00', '09:30', 'confirmed', 'in_person', 'Blood pressure check'),
  ('bbbbbbbb-2222-4000-8000-000000000001', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date, '10:00', '10:30', 'scheduled', 'in_person', 'Follow-up visit'),
  ('bbbbbbbb-2222-4000-8000-000000000004', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date, '14:00', '14:30', 'in_progress', 'video', 'New symptoms consultation'),
  -- Future
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date + 3, '10:00', '10:30', 'scheduled', 'in_person', 'Follow-up appointment'),
  ('bbbbbbbb-2222-4000-8000-000000000002', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date + 5, '11:00', '11:30', 'scheduled', 'video', 'Telemedicine check-in'),
  ('bbbbbbbb-2222-4000-8000-000000000003', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date + 7, '09:00', '09:30', 'confirmed', 'in_person', 'Preventive screening');

-- Dr. James Wilson (Cardiology)
INSERT INTO public.appointments (patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, type, reason) VALUES
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date - 25, '09:00', '09:30', 'completed', 'in_person', 'Heart palpitation concerns'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date - 10, '10:00', '10:30', 'completed', 'in_person', 'ECG results review'),
  ('bbbbbbbb-2222-4000-8000-000000000001', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date - 18, '14:00', '14:30', 'completed', 'in_person', 'Chest pain evaluation'),
  ('bbbbbbbb-2222-4000-8000-000000000002', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date - 8, '11:00', '11:30', 'completed', 'video', 'Blood pressure management'),
  ('bbbbbbbb-2222-4000-8000-000000000004', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date - 5, '09:30', '10:00', 'no_show', 'in_person', 'Cardiac stress test'),
  -- Today
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date, '11:00', '11:30', 'scheduled', 'in_person', 'Cardiac stress test'),
  ('bbbbbbbb-2222-4000-8000-000000000003', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date, '14:00', '14:30', 'confirmed', 'in_person', 'Arrhythmia evaluation'),
  -- Future
  ('bbbbbbbb-2222-4000-8000-000000000001', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date + 4, '09:00', '09:30', 'scheduled', 'in_person', 'Follow-up after stress test'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', 'aaaaaaaa-1111-4000-8000-000000000001', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date + 14, '10:00', '10:30', 'scheduled', 'video', 'Quarterly cardiology review');

-- Dr. Maria Garcia (Dermatology)
INSERT INTO public.appointments (patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, type, reason) VALUES
  ('bbbbbbbb-2222-4000-8000-000000000001', 'aaaaaaaa-1111-4000-8000-000000000002', (SELECT id FROM departments WHERE name = 'Dermatology'), current_date - 30, '09:00', '09:30', 'completed', 'in_person', 'Acne treatment consultation'),
  ('bbbbbbbb-2222-4000-8000-000000000003', 'aaaaaaaa-1111-4000-8000-000000000002', (SELECT id FROM departments WHERE name = 'Dermatology'), current_date - 22, '13:00', '13:30', 'completed', 'in_person', 'Eczema flare-up'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', 'aaaaaaaa-1111-4000-8000-000000000002', (SELECT id FROM departments WHERE name = 'Dermatology'), current_date - 15, '10:00', '10:30', 'completed', 'video', 'Skin rash follow-up'),
  ('bbbbbbbb-2222-4000-8000-000000000004', 'aaaaaaaa-1111-4000-8000-000000000002', (SELECT id FROM departments WHERE name = 'Dermatology'), current_date - 4, '14:00', '14:30', 'cancelled', 'in_person', 'Mole examination'),
  -- Future
  ('bbbbbbbb-2222-4000-8000-000000000001', 'aaaaaaaa-1111-4000-8000-000000000002', (SELECT id FROM departments WHERE name = 'Dermatology'), current_date + 6, '09:00', '09:30', 'scheduled', 'in_person', 'Acne treatment follow-up'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', 'aaaaaaaa-1111-4000-8000-000000000002', (SELECT id FROM departments WHERE name = 'Dermatology'), current_date + 12, '11:00', '11:30', 'scheduled', 'video', 'Skin check consultation');

-- Dr. Robert Kim (Orthopedics)
INSERT INTO public.appointments (patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, type, reason) VALUES
  ('bbbbbbbb-2222-4000-8000-000000000002', 'aaaaaaaa-1111-4000-8000-000000000003', (SELECT id FROM departments WHERE name = 'Orthopedics'), current_date - 28, '09:00', '09:30', 'completed', 'in_person', 'Knee pain evaluation'),
  ('bbbbbbbb-2222-4000-8000-000000000002', 'aaaaaaaa-1111-4000-8000-000000000003', (SELECT id FROM departments WHERE name = 'Orthopedics'), current_date - 14, '10:00', '10:30', 'completed', 'in_person', 'MRI results review'),
  ('bbbbbbbb-2222-4000-8000-000000000004', 'aaaaaaaa-1111-4000-8000-000000000003', (SELECT id FROM departments WHERE name = 'Orthopedics'), current_date - 12, '14:00', '14:30', 'completed', 'in_person', 'Back pain consultation'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', 'aaaaaaaa-1111-4000-8000-000000000003', (SELECT id FROM departments WHERE name = 'Orthopedics'), current_date - 6, '11:00', '11:30', 'completed', 'video', 'Shoulder injury follow-up'),
  -- Today
  ('bbbbbbbb-2222-4000-8000-000000000002', 'aaaaaaaa-1111-4000-8000-000000000003', (SELECT id FROM departments WHERE name = 'Orthopedics'), current_date, '09:00', '09:30', 'confirmed', 'in_person', 'Physical therapy progress review'),
  -- Future
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', 'aaaaaaaa-1111-4000-8000-000000000003', (SELECT id FROM departments WHERE name = 'Orthopedics'), current_date + 8, '13:00', '13:30', 'scheduled', 'in_person', 'Joint pain assessment'),
  ('bbbbbbbb-2222-4000-8000-000000000004', 'aaaaaaaa-1111-4000-8000-000000000003', (SELECT id FROM departments WHERE name = 'Orthopedics'), current_date + 15, '10:00', '10:30', 'scheduled', 'video', 'Post-treatment check-in');

-- 9. Medical records for completed appointments
-- Dr. Sarah Chen's records
INSERT INTO public.medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes)
SELECT a.patient_id, a.doctor_id, a.id, d.diagnosis, d.prescription, d.notes
FROM public.appointments a
CROSS JOIN LATERAL (VALUES
  ('Hypertension - Stage 1', 'Lisinopril 10mg daily. Monitor blood pressure twice daily.', 'Blood pressure 145/92. Advised dietary modifications: reduce sodium intake, increase potassium-rich foods. Follow up in 4 weeks.'),
  ('Vitamin D deficiency', 'Vitamin D3 2000 IU daily for 8 weeks, then 1000 IU maintenance.', 'Lab results show 25-OH Vitamin D at 18 ng/mL. Patient reports fatigue and muscle aches. Recheck levels in 8 weeks.'),
  ('Upper respiratory infection', 'Amoxicillin 500mg three times daily for 7 days. Acetaminophen as needed.', 'Cough, nasal congestion, low-grade fever for 3 days. Throat erythematous. Lungs clear. Treating empirically.'),
  ('Type 2 Diabetes - Well controlled', 'Continue Metformin 500mg twice daily. Increase to 850mg if A1C > 7%.', 'A1C at 7.2%, down from 7.8%. Fasting glucose 128 mg/dL. Diet and exercise adherent. Foot exam normal.'),
  ('Seasonal allergic rhinitis', 'Cetirizine 10mg daily. Fluticasone nasal spray 2 sprays each nostril.', 'Sneezing, rhinorrhea, itchy eyes for 3 weeks. Nasal mucosa pale and boggy. Allergy testing recommended.'),
  ('Iron deficiency anemia', 'Ferrous sulfate 325mg daily with vitamin C. Recheck CBC in 6 weeks.', 'Hemoglobin 10.8 g/dL. Fatigue and pallor noted. Dietary counseling provided. GI workup if no improvement.'),
  ('Acute bronchitis', 'Dextromethorphan as needed for cough. Rest and fluids.', 'Productive cough for 5 days. No fever. Lungs with scattered rhonchi. Chest X-ray clear. Viral etiology likely.'),
  ('Gastroesophageal reflux', 'Omeprazole 20mg daily before breakfast for 8 weeks.', 'Heartburn and regurgitation worsening over 2 months. Lifestyle modifications discussed. If no improvement, consider endoscopy.')
) AS d(diagnosis, prescription, notes)
WHERE a.status = 'completed' AND a.doctor_id = '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59'
ORDER BY a.appointment_date
LIMIT 8;

-- Dr. James Wilson's records (Cardiology)
INSERT INTO public.medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes)
SELECT a.patient_id, a.doctor_id, a.id, d.diagnosis, d.prescription, d.notes
FROM public.appointments a
CROSS JOIN LATERAL (VALUES
  ('Sinus tachycardia', 'Metoprolol 25mg twice daily. Avoid caffeine and stimulants.', 'Resting HR 105 bpm. ECG shows sinus tachycardia, no other abnormalities. TSH normal. Echocardiogram ordered.'),
  ('Essential hypertension', 'Amlodipine 5mg daily. Home BP monitoring log requested.', 'BP 152/96. No end-organ damage. Started on calcium channel blocker. Lifestyle modifications reinforced.'),
  ('Atypical chest pain - non-cardiac', 'Omeprazole 40mg daily. Follow up if symptoms persist.', 'Troponin negative x2. ECG normal. Stress echo normal. Likely musculoskeletal or GERD-related. Reassurance provided.'),
  ('Prehypertension', 'No medication at this time. DASH diet recommended. Exercise 150 min/week.', 'BP 135/88. BMI 28.4. Lipid panel borderline. 6-month lifestyle modification trial before considering medication.')
) AS d(diagnosis, prescription, notes)
WHERE a.status = 'completed' AND a.doctor_id = 'aaaaaaaa-1111-4000-8000-000000000001'
ORDER BY a.appointment_date
LIMIT 4;

-- Dr. Maria Garcia's records (Dermatology)
INSERT INTO public.medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes)
SELECT a.patient_id, a.doctor_id, a.id, d.diagnosis, d.prescription, d.notes
FROM public.appointments a
CROSS JOIN LATERAL (VALUES
  ('Acne vulgaris - moderate', 'Tretinoin 0.025% cream nightly. Benzoyl peroxide 5% wash AM.', 'Moderate inflammatory and comedonal acne on face and upper back. Started topical retinoid. Sun protection advised.'),
  ('Atopic dermatitis flare', 'Triamcinolone 0.1% cream twice daily for 2 weeks. Cetirizine 10mg daily.', 'Erythematous, excoriated patches on antecubital fossae. Skin barrier repair emphasized. Moisturize liberally.'),
  ('Contact dermatitis', 'Hydrocortisone 1% cream twice daily. Identify and avoid allergen.', 'Pruritic erythematous rash on hands consistent with contact dermatitis. Patch testing recommended if recurrent.')
) AS d(diagnosis, prescription, notes)
WHERE a.status = 'completed' AND a.doctor_id = 'aaaaaaaa-1111-4000-8000-000000000002'
ORDER BY a.appointment_date
LIMIT 3;

-- Dr. Robert Kim's records (Orthopedics)
INSERT INTO public.medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes)
SELECT a.patient_id, a.doctor_id, a.id, d.diagnosis, d.prescription, d.notes
FROM public.appointments a
CROSS JOIN LATERAL (VALUES
  ('Patellofemoral pain syndrome', 'Ibuprofen 400mg as needed. Physical therapy 2x/week for 6 weeks.', 'Anterior knee pain with stair climbing and prolonged sitting. Positive patellar grind test. X-ray shows no fracture. VMO strengthening program.'),
  ('Mild disc herniation L4-L5', 'Naproxen 500mg twice daily with food. PT referral for McKenzie exercises.', 'MRI confirms small posterolateral disc herniation L4-L5. No significant neural compromise. Conservative management trial.'),
  ('Lumbar strain', 'Cyclobenzaprine 10mg at bedtime for 7 days. Ice/heat alternating.', 'Acute low back pain after lifting. No radiculopathy. ROM limited by pain. No red flags. Return if not improved in 2 weeks.'),
  ('Rotator cuff tendinitis', 'Meloxicam 15mg daily for 2 weeks. PT for rotator cuff strengthening.', 'Right shoulder pain with overhead activities. Positive Neer and Hawkins tests. MRI ordered to rule out tear. Activity modification advised.')
) AS d(diagnosis, prescription, notes)
WHERE a.status = 'completed' AND a.doctor_id = 'aaaaaaaa-1111-4000-8000-000000000003'
ORDER BY a.appointment_date
LIMIT 4;
