"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { classNames, formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/types/database";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no_show", label: "No Show" },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      const supabase = createClient();
      const { data } = await supabase
        .from("appointments")
        .select("*, patient:profiles!appointments_patient_profile_fkey(full_name, avatar_url), doctor:profiles!appointments_doctor_profile_fkey(full_name, avatar_url), department:departments(name)")
        .order("appointment_date", { ascending: false });

      setAppointments(data || []);
      setLoading(false);
    }

    fetchAppointments();
  }, []);

  const filtered = appointments.filter((a) => {
    if (activeTab === "all") return true;
    return a.status === activeTab;
  });

  if (loading) {
    return (
      <div>
        <DashboardHeader title="All Appointments" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="All Appointments" subtitle="View all appointments across the system" />

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
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

      <Card>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Patient</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Doctor</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Time</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((appt) => (
                  <tr key={appt.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={appt.patient?.avatar_url} name={appt.patient?.full_name} size="sm" />
                        <span className="text-sm text-gray-900 dark:text-white">{appt.patient?.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={appt.doctor?.avatar_url} name={appt.doctor?.full_name} size="sm" />
                        <span className="text-sm text-gray-900 dark:text-white">{appt.doctor?.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {appt.department?.name || "—"}
                    </td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(appt.appointment_date)}
                    </td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(appt.start_time)}
                    </td>
                    <td className="py-3">
                      <Badge status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((appt) => (
              <div key={appt.id} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar src={appt.patient?.avatar_url} name={appt.patient?.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{appt.patient?.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Dr. {appt.doctor?.full_name} &middot; {appt.department?.name}
                      </p>
                    </div>
                  </div>
                  <Badge status={appt.status} />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(appt.appointment_date)} at {formatTime(appt.start_time)}
                </p>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No appointments found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
