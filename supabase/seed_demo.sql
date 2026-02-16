-- ============================================================
-- HealthConnect: Demo Seed Data
-- Doctor: 4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59
-- Patient: e054f814-15b4-4fab-b4b0-b1e04a331bce
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

-- 2. Update doctor profile
UPDATE public.profiles SET
  full_name = 'Dr. Sarah Chen',
  phone = '555-100-0001',
  department_id = (SELECT id FROM public.departments WHERE name = 'General Medicine'),
  specialization = 'Internal Medicine',
  bio = 'Board-certified physician with over 15 years of clinical experience. Passionate about preventive medicine and patient-centered care.'
WHERE user_id = '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59';

-- 3. Update patient profile
UPDATE public.profiles SET
  full_name = COALESCE(full_name, 'Demo Patient'),
  phone = '555-200-0001',
  date_of_birth = '1992-05-14',
  address = '123 Main Street, Springfield, IL 62701'
WHERE user_id = 'e054f814-15b4-4fab-b4b0-b1e04a331bce';

-- 4. Doctor schedule (Mon-Fri, 9am-5pm)
DELETE FROM public.doctor_schedules WHERE doctor_id = '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59';
INSERT INTO public.doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
  ('4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', 1, '09:00', '17:00', true),
  ('4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', 2, '09:00', '17:00', true),
  ('4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', 3, '09:00', '17:00', true),
  ('4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', 4, '09:00', '17:00', true),
  ('4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', 5, '09:00', '17:00', true);

-- 5. Appointments - mix of past, today, and future
DELETE FROM public.medical_records WHERE doctor_id = '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59';
DELETE FROM public.appointments WHERE doctor_id = '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59';

-- Past completed appointments
INSERT INTO public.appointments (patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, type, reason) VALUES
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 45, '09:00', '09:30', 'completed', 'in_person', 'Annual checkup'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 30, '10:00', '10:30', 'completed', 'in_person', 'Follow-up visit'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 21, '14:00', '14:30', 'completed', 'video', 'Test results review'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 14, '11:00', '11:30', 'completed', 'in_person', 'Chronic condition management'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 7, '09:30', '10:00', 'completed', 'in_person', 'Prescription renewal'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date - 5, '13:00', '13:30', 'completed', 'in_person', 'Heart palpitation concerns'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date - 3, '15:00', '15:30', 'cancelled', 'video', 'Follow-up consultation'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'Dermatology'), current_date - 2, '10:00', '10:30', 'no_show', 'in_person', 'Skin rash examination');

-- Today's appointments
INSERT INTO public.appointments (patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, type, reason) VALUES
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date, '09:00', '09:30', 'confirmed', 'in_person', 'Blood pressure check'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date, '11:00', '11:30', 'scheduled', 'video', 'Medication review'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date, '14:00', '14:30', 'in_progress', 'in_person', 'New symptoms consultation');

-- Future appointments
INSERT INTO public.appointments (patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, type, reason) VALUES
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date + 3, '10:00', '10:30', 'scheduled', 'in_person', 'Follow-up appointment'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'Cardiology'), current_date + 7, '09:00', '09:30', 'confirmed', 'in_person', 'Cardiac stress test'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date + 10, '13:00', '13:30', 'scheduled', 'video', 'Telemedicine check-in'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'General Medicine'), current_date + 14, '15:00', '15:30', 'scheduled', 'in_person', 'Preventive screening'),
  ('e054f814-15b4-4fab-b4b0-b1e04a331bce', '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59', (SELECT id FROM departments WHERE name = 'Neurology'), current_date + 21, '11:00', '11:30', 'scheduled', 'in_person', 'Recurring headache evaluation');

-- 6. Medical records for completed appointments
INSERT INTO public.medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes)
SELECT
  a.patient_id, a.doctor_id, a.id,
  d.diagnosis, d.prescription, d.notes
FROM public.appointments a
CROSS JOIN LATERAL (
  VALUES
    ('Hypertension - Stage 1', 'Lisinopril 10mg daily. Monitor blood pressure twice daily.', 'Blood pressure 145/92. Advised dietary modifications: reduce sodium intake, increase potassium-rich foods. Follow up in 4 weeks.'),
    ('Vitamin D deficiency', 'Vitamin D3 2000 IU daily for 8 weeks, then 1000 IU maintenance.', 'Lab results show 25-OH Vitamin D at 18 ng/mL. Patient reports fatigue and muscle aches. Recheck levels in 8 weeks.'),
    ('Upper respiratory infection', 'Amoxicillin 500mg three times daily for 7 days. Acetaminophen as needed for fever.', 'Presenting with cough, nasal congestion, and low-grade fever for 3 days. Throat erythematous. Lungs clear. Likely viral but treating empirically given duration.'),
    ('Type 2 Diabetes - Well controlled', 'Continue Metformin 500mg twice daily. Increase to 850mg if A1C remains above 7%.', 'A1C at 7.2%, down from 7.8%. Fasting glucose 128 mg/dL. Patient adhering to diet and exercise plan. Foot exam normal. Eye exam referral sent.'),
    ('Mild osteoarthritis - Right knee', 'Ibuprofen 400mg as needed (max 3x daily with food). Physical therapy referral.', 'Right knee pain worsening over past 2 months. X-ray shows mild joint space narrowing. ROM slightly reduced. No effusion. Recommended PT and weight management.'),
    ('Seasonal allergic rhinitis', 'Cetirizine 10mg daily. Fluticasone nasal spray 2 sprays each nostril daily.', 'Sneezing, rhinorrhea, and itchy eyes for past 3 weeks. No fever or purulent discharge. Nasal mucosa pale and boggy. Allergy testing recommended if symptoms persist.')
) AS d(diagnosis, prescription, notes)
WHERE a.status = 'completed'
  AND a.doctor_id = '4aa2a2b1-dd06-4efc-b60c-6bd2bc94ef59'
ORDER BY a.appointment_date
LIMIT 6;
