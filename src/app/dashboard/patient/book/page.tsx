"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { classNames, formatTime } from "@/lib/utils";
import type { Department, Profile, DoctorSchedule } from "@/types/database";

type Step = "department" | "doctor" | "datetime" | "confirm";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30",
];

export default function BookAppointmentPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("department");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Profile | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState<"in_person" | "video">("in_person");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      const supabase = createClient();
      const { data } = await supabase.from("departments").select("*").order("name");
      setDepartments(data || []);
      setLoading(false);
    }
    fetchDepartments();
  }, []);

  async function selectDepartment(dept: Department) {
    setSelectedDept(dept);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "doctor")
      .eq("department_id", dept.id);
    setDoctors(data || []);
    setStep("doctor");
  }

  async function selectDoctor(doctor: Profile) {
    setSelectedDoctor(doctor);
    const supabase = createClient();
    const { data } = await supabase
      .from("doctor_schedules")
      .select("*")
      .eq("doctor_id", doctor.user_id)
      .eq("is_available", true);
    setSchedules(data || []);
    setStep("datetime");
  }

  function getAvailableDays(): number[] {
    return schedules.map((s) => s.day_of_week);
  }

  function isDateAvailable(dateStr: string): boolean {
    const date = new Date(dateStr + "T12:00:00");
    const dayOfWeek = date.getDay();
    return getAvailableDays().includes(dayOfWeek);
  }

  function getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  async function handleSubmit() {
    if (!userId || !selectedDoctor || !selectedDept || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    const supabase = createClient();

    const endTime = (() => {
      const [h, m] = selectedTime.split(":").map(Number);
      const end = new Date(2000, 0, 1, h, m + 30);
      return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
    })();

    const { error } = await supabase.from("appointments").insert({
      patient_id: userId,
      doctor_id: selectedDoctor.user_id,
      department_id: selectedDept.id,
      appointment_date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
      type: appointmentType,
      reason: reason || null,
    });

    if (error) {
      alert("Failed to book appointment. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard/patient/appointments");
  }

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Book Appointment" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Book Appointment"
        subtitle={
          step === "department" ? "Select a department" :
          step === "doctor" ? "Choose your doctor" :
          step === "datetime" ? "Pick a date and time" :
          "Confirm your appointment"
        }
      />

      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {(["department", "doctor", "datetime", "confirm"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={classNames(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
              step === s ? "bg-brand-500 text-white" :
              (["department", "doctor", "datetime", "confirm"].indexOf(step) > i) ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400" :
              "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {i + 1}
            </div>
            {i < 3 && <div className="h-px w-8 bg-gray-300 dark:bg-gray-700" />}
          </div>
        ))}
      </div>

      {/* Step 1: Department */}
      {step === "department" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => selectDepartment(dept)}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-left transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
              {dept.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{dept.description}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Doctor */}
      {step === "doctor" && (
        <div>
          <button onClick={() => setStep("department")} className="mb-4 text-sm text-brand-600 hover:text-brand-500 dark:text-brand-400">
            &larr; Back to departments
          </button>
          {doctors.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => selectDoctor(doc)}
                  className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
                >
                  <Avatar src={doc.avatar_url} name={doc.full_name} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{doc.full_name}</h3>
                    {doc.specialization && (
                      <p className="text-sm text-brand-600 dark:text-brand-400">{doc.specialization}</p>
                    )}
                    {doc.bio && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{doc.bio}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No doctors available in this department.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === "datetime" && (
        <div>
          <button onClick={() => setStep("doctor")} className="mb-4 text-sm text-brand-600 hover:text-brand-500 dark:text-brand-400">
            &larr; Back to doctors
          </button>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Select Date</h3>
                <input
                  type="date"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isDateAvailable(val)) {
                      setSelectedDate(val);
                      setSelectedTime("");
                    } else {
                      alert("Doctor is not available on this day.");
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                {schedules.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Available: {schedules.map(s => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][s.day_of_week]).join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Select Time</h3>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={classNames(
                          "rounded-lg border px-3 py-2 text-sm font-medium transition",
                          selectedTime === slot
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                            : "border-gray-200 text-gray-600 hover:border-brand-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-700"
                        )}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select a date first</p>
                )}
              </CardContent>
            </Card>
          </div>
          {selectedDate && selectedTime && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setStep("confirm")}>Continue</Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === "confirm" && (
        <div>
          <button onClick={() => setStep("datetime")} className="mb-4 text-sm text-brand-600 hover:text-brand-500 dark:text-brand-400">
            &larr; Back to date/time
          </button>
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment Summary</h3>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Department</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDept?.name}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Doctor</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDoctor?.full_name}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Date</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDate}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Time</span>
                  <p className="font-medium text-gray-900 dark:text-white">{formatTime(selectedTime)}</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Appointment Type
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAppointmentType("in_person")}
                    className={classNames(
                      "rounded-lg border-2 px-4 py-2 text-sm font-medium transition",
                      appointmentType === "in_person"
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                        : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                    )}
                  >
                    In-person
                  </button>
                  <button
                    onClick={() => setAppointmentType("video")}
                    className={classNames(
                      "rounded-lg border-2 px-4 py-2 text-sm font-medium transition",
                      appointmentType === "video"
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                        : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                    )}
                  >
                    Video Call
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason (optional)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  placeholder="Describe your symptoms or reason for visit..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} loading={submitting} size="lg">
                  Confirm Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
