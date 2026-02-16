"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import AppointmentCard from "@/components/shared/AppointmentCard";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Appointment } from "@/types/database";

export default function DoctorDashboard() {
  const { userId } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ today: 0, thisWeek: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      const { data: todayData } = await supabase
        .from("appointments")
        .select("*, patient:profiles!appointments_patient_id_fkey(full_name, avatar_url), department:departments(name)")
        .eq("doctor_id", userId)
        .eq("appointment_date", today)
        .order("start_time", { ascending: true });

      setTodayAppointments(todayData || []);

      const { count: todayCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", userId)
        .eq("appointment_date", today);

      const { count: weekCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", userId)
        .gte("appointment_date", today)
        .lte("appointment_date", weekEndStr);

      const { count: completedCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", userId)
        .eq("status", "completed");

      const { count: pendingCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", userId)
        .in("status", ["scheduled", "confirmed"]);

      setStats({
        today: todayCount || 0,
        thisWeek: weekCount || 0,
        completed: completedCount || 0,
        pending: pendingCount || 0,
      });

      setLoading(false);
    }

    fetchData();
  }, [userId]);

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

    // Refresh
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("appointments")
      .select("*, patient:profiles!appointments_patient_id_fkey(full_name, avatar_url), department:departments(name)")
      .eq("doctor_id", userId)
      .eq("appointment_date", today)
      .order("start_time", { ascending: true });
    setTodayAppointments(data || []);
  }

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Doctor Dashboard" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="Doctor Dashboard" subtitle="Welcome back! Here's your schedule overview." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.thisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <p className="mt-1 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Appointments</h2>
          <Link href="/dashboard/doctor/appointments" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
            View all
          </Link>
        </div>
        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} viewAs="doctor" onAction={handleAction} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No appointments scheduled for today.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
