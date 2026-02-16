-- ============================================================
-- HealthConnect: Seed Data
-- ============================================================
--
-- Usage:
--   1. Run the migration (001_initial_schema.sql) first
--   2. Create users via Supabase Auth (signup or dashboard):
--      - 1 admin, 3-5 doctors, 5-10 patients
--   3. Insert departments (below)
--   4. Call seed_healthcare_data() with the user UUIDs
--
-- Example:
--   SELECT seed_healthcare_data(
--     admin_uid   := 'uuid-of-admin',
--     doctor_uids := ARRAY['uuid-doc-1', 'uuid-doc-2', 'uuid-doc-3', 'uuid-doc-4', 'uuid-doc-5'],
--     patient_uids := ARRAY['uuid-pat-1', 'uuid-pat-2', 'uuid-pat-3', 'uuid-pat-4', 'uuid-pat-5',
--                           'uuid-pat-6', 'uuid-pat-7', 'uuid-pat-8', 'uuid-pat-9', 'uuid-pat-10']
--   );
-- ============================================================

-- Insert departments (idempotent)
INSERT INTO public.departments (name, description, icon) VALUES
  ('General Medicine', 'Primary care and general health consultations', 'stethoscope'),
  ('Cardiology', 'Heart and cardiovascular system specialists', 'heart'),
  ('Dermatology', 'Skin, hair, and nail care specialists', 'shield'),
  ('Orthopedics', 'Bone, joint, and muscle specialists', 'bone'),
  ('Pediatrics', 'Healthcare for infants, children, and adolescents', 'baby'),
  ('Neurology', 'Brain and nervous system specialists', 'brain')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Seed function
-- ============================================================
CREATE OR REPLACE FUNCTION seed_healthcare_data(
  admin_uid uuid,
  doctor_uids uuid[],
  patient_uids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dept_ids uuid[];
  doc_uid uuid;
  pat_uid uuid;
  dept_id uuid;
  i integer;
  j integer;
  appt_date date;
  appt_status text;
  appt_type text;
  appt_id uuid;
  statuses text[] := ARRAY['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  specializations text[][] := ARRAY[
    ARRAY['Internal Medicine', 'Family Medicine', 'Preventive Care'],
    ARRAY['Interventional Cardiology', 'Electrophysiology', 'Heart Failure'],
    ARRAY['Cosmetic Dermatology', 'Dermatopathology', 'Pediatric Dermatology'],
    ARRAY['Sports Medicine', 'Joint Replacement', 'Spine Surgery'],
    ARRAY['Neonatal Care', 'Developmental Pediatrics', 'Adolescent Medicine'],
    ARRAY['Epilepsy', 'Movement Disorders', 'Neuromuscular Medicine']
  ];
  doctor_names text[] := ARRAY['Dr. Sarah Chen', 'Dr. James Wilson', 'Dr. Maria Garcia', 'Dr. Robert Kim', 'Dr. Emily Johnson'];
  patient_names text[] := ARRAY['Alice Thompson', 'Bob Martinez', 'Carol Davis', 'David Lee', 'Emma Wilson', 'Frank Brown', 'Grace Taylor', 'Henry Anderson', 'Ivy Robinson', 'Jack White'];
  bios text[] := ARRAY[
    'Board-certified physician with over 15 years of clinical experience. Passionate about preventive medicine and patient-centered care.',
    'Dedicated specialist with extensive research background. Focused on minimally invasive treatment approaches.',
    'Award-winning physician committed to evidence-based medicine. Special interest in complex diagnostic cases.',
    'Experienced practitioner known for compassionate patient care. Active in medical education and community health.',
    'Innovative physician combining traditional and modern treatment methods. Published researcher in peer-reviewed journals.'
  ];
  reasons text[] := ARRAY[
    'Annual checkup', 'Follow-up visit', 'New symptoms consultation',
    'Prescription renewal', 'Test results review', 'Chronic condition management',
    'Acute pain', 'Preventive screening', 'Second opinion', 'Post-surgery follow-up'
  ];
  diagnoses text[] := ARRAY[
    'Hypertension - Stage 1', 'Type 2 Diabetes - Well controlled', 'Seasonal allergic rhinitis',
    'Mild osteoarthritis - Right knee', 'Vitamin D deficiency', 'Migraine without aura',
    'Upper respiratory infection', 'Generalized anxiety disorder', 'Iron deficiency anemia',
    'Contact dermatitis', 'Lumbar strain', 'Gastroesophageal reflux disease'
  ];
  prescriptions text[] := ARRAY[
    'Lisinopril 10mg daily', 'Metformin 500mg twice daily', 'Cetirizine 10mg daily',
    'Ibuprofen 400mg as needed', 'Vitamin D3 2000 IU daily', 'Sumatriptan 50mg as needed',
    'Amoxicillin 500mg three times daily for 10 days', 'Sertraline 50mg daily',
    'Ferrous sulfate 325mg daily', 'Hydrocortisone cream 1% twice daily',
    'Physical therapy referral', 'Omeprazole 20mg daily'
  ];
  time_slots time[] := ARRAY['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
BEGIN
  -- Get department IDs in order
  SELECT array_agg(id ORDER BY name) INTO dept_ids FROM public.departments;

  -- Clean existing seed data for these users
  DELETE FROM public.medical_records WHERE doctor_id = ANY(doctor_uids) OR patient_id = ANY(patient_uids);
  DELETE FROM public.appointments WHERE doctor_id = ANY(doctor_uids) OR patient_id = ANY(patient_uids);
  DELETE FROM public.doctor_schedules WHERE doctor_id = ANY(doctor_uids);

  -- Update admin profile
  UPDATE public.profiles
  SET role = 'admin', full_name = 'System Administrator', phone = '555-000-0001'
  WHERE user_id = admin_uid;

  -- Update doctor profiles with departments and specializations
  FOR i IN 1..array_length(doctor_uids, 1) LOOP
    dept_id := dept_ids[((i - 1) % array_length(dept_ids, 1)) + 1];
    UPDATE public.profiles
    SET
      role = 'doctor',
      full_name = doctor_names[i],
      phone = '555-100-' || lpad(i::text, 4, '0'),
      department_id = dept_id,
      specialization = specializations[((i - 1) % 6) + 1][((i - 1) % 3) + 1],
      bio = bios[i]
    WHERE user_id = doctor_uids[i];

    -- Create weekly schedule for each doctor (Mon-Fri, 9am-5pm)
    FOR j IN 1..5 LOOP  -- Monday=1 to Friday=5
      INSERT INTO public.doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available)
      VALUES (doctor_uids[i], j, '09:00', '17:00', true);
    END LOOP;
  END LOOP;

  -- Update patient profiles
  FOR i IN 1..array_length(patient_uids, 1) LOOP
    UPDATE public.profiles
    SET
      role = 'patient',
      full_name = patient_names[i],
      phone = '555-200-' || lpad(i::text, 4, '0'),
      date_of_birth = '1970-01-01'::date + (i * 1000 + (random() * 5000)::int),
      address = (100 + i * 10)::text || ' Main Street, City, ST ' || lpad((10000 + i * 111)::text, 5, '0')
    WHERE user_id = patient_uids[i];
  END LOOP;

  -- Generate appointments (150+)
  FOR i IN 1..180 LOOP
    -- Random patient and doctor
    pat_uid := patient_uids[((i - 1) % array_length(patient_uids, 1)) + 1];
    doc_uid := doctor_uids[((i - 1) % array_length(doctor_uids, 1)) + 1];

    -- Get doctor's department
    SELECT department_id INTO dept_id FROM public.profiles WHERE user_id = doc_uid;

    -- Random date within last 90 days to next 30 days
    appt_date := current_date - (90 - (random() * 120)::int);

    -- Status based on date
    IF appt_date < current_date THEN
      -- Past appointments: mostly completed
      appt_status := (ARRAY['completed', 'completed', 'completed', 'completed', 'cancelled', 'no_show'])[floor(random() * 6 + 1)::int];
    ELSIF appt_date = current_date THEN
      appt_status := (ARRAY['scheduled', 'confirmed', 'in_progress'])[floor(random() * 3 + 1)::int];
    ELSE
      -- Future appointments: scheduled or confirmed
      appt_status := (ARRAY['scheduled', 'scheduled', 'confirmed'])[floor(random() * 3 + 1)::int];
    END IF;

    -- Random type
    appt_type := (ARRAY['in_person', 'in_person', 'in_person', 'video'])[floor(random() * 4 + 1)::int];

    INSERT INTO public.appointments (
      patient_id, doctor_id, department_id,
      appointment_date, start_time, end_time,
      status, type, reason
    ) VALUES (
      pat_uid, doc_uid, dept_id,
      appt_date,
      time_slots[floor(random() * array_length(time_slots, 1) + 1)::int],
      time_slots[floor(random() * array_length(time_slots, 1) + 1)::int] + interval '30 minutes',
      appt_status, appt_type,
      reasons[floor(random() * array_length(reasons, 1) + 1)::int]
    )
    RETURNING id INTO appt_id;

    -- Create medical record for completed past appointments (60% chance)
    IF appt_status = 'completed' AND random() < 0.6 THEN
      INSERT INTO public.medical_records (
        patient_id, doctor_id, appointment_id,
        diagnosis, prescription, notes
      ) VALUES (
        pat_uid, doc_uid, appt_id,
        diagnoses[floor(random() * array_length(diagnoses, 1) + 1)::int],
        prescriptions[floor(random() * array_length(prescriptions, 1) + 1)::int],
        'Patient presenting with reported symptoms. Examination conducted. Treatment plan discussed and agreed upon.'
      );
    END IF;
  END LOOP;

  RAISE NOTICE 'Seed data created successfully for HealthConnect';
END;
$$;
