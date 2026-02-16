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
  { key: "scheduled", label: "Scheduled" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export default function DoctorAppointmentsPage() {
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
      .select("*, patient:profiles!appointments_patient_id_fkey(full_name, avatar_url), department:departments(name)")
      .eq("doctor_id", userId)
      .order("appointment_date", { ascending: false });

    setAppointments(data || []);
    setLoading(false);
  }

  async function handleAction(action: string, appointment: Appointment) {
    const supabase = createClient();
    const statusMap: Record<string, string> = {
      confirm: "confirmed",
      start: "in_progress",
      complete: "completed",
      no_show: "no_show",
    };
    const newStatus = statusMap[action];
    if (!newStatus) return;

    await supabase.from("appointments").update({ status: newStatus }).eq("id", appointment.id);
    fetchAppointments();
  }

  const filtered = appointments.filter((a) => {
    if (activeTab === "all") return true;
    return a.status === activeTab;
  });

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Appointments" />
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
      <DashboardHeader title="Appointments" subtitle="Manage your patient appointments" />

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={classNames(
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition",
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
            <AppointmentCard key={appt.id} appointment={appt} viewAs="doctor" onAction={handleAction} />
          ))}
        </div>
      ) : (
        <EmptyState title="No appointments found" description={`No ${activeTab !== "all" ? activeTab : ""} appointments.`} />
      )}
    </div>
  );
}
