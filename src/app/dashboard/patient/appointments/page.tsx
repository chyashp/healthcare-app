"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import AppointmentCard from "@/components/shared/AppointmentCard";
import EmptyState from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { classNames } from "@/lib/utils";
import type { Appointment } from "@/types/database";

const TABS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function PatientAppointmentsPage() {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchAppointments();
  }, [userId]);

  async function fetchAppointments() {
    const supabase = createClient();
    const { data } = await supabase
      .from("appointments")
      .select("*, doctor:profiles!appointments_doctor_profile_fkey(full_name, avatar_url, specialization), department:departments(name)")
      .eq("patient_id", userId)
      .order("appointment_date", { ascending: false });

    setAppointments(data || []);
    setLoading(false);
  }

  async function handleAction(action: string, appointment: Appointment) {
    if (action === "cancel") {
      if (!confirm("Are you sure you want to cancel this appointment?")) return;
      const supabase = createClient();
      await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointment.id);
      fetchAppointments();
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const filtered = appointments.filter((a) => {
    if (activeTab === "upcoming") return a.appointment_date >= today && ["scheduled", "confirmed"].includes(a.status);
    if (activeTab === "completed") return a.status === "completed";
    if (activeTab === "cancelled") return a.status === "cancelled";
    return true;
  });

  if (loading) {
    return (
      <div>
        <DashboardHeader title="My Appointments" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="My Appointments" subtitle="View and manage your appointments" />

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={classNames(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              activeTab === tab.key
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              viewAs="patient"
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No appointments found"
          description={activeTab !== "all" ? `No ${activeTab} appointments.` : "You haven't booked any appointments yet."}
        />
      )}
    </div>
  );
}
