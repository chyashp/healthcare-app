export type UserRole = "patient" | "doctor" | "admin";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentType = "in_person" | "video";

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  department_id: string | null;
  specialization: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

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
  patient?: Profile;
  doctor?: Profile;
  department?: Department;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  diagnosis: string;
  prescription: string | null;
  notes: string | null;
  created_at: string;
  patient?: Profile;
  doctor?: Profile;
  appointment?: Appointment;
}
