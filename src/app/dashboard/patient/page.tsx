"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import AppointmentCard from "@/components/shared/AppointmentCard";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Appointment } from "@/types/database";

export default function PatientDashboard() {
  const { userId } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ upcoming: 0, total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const { data: upcoming } = await supabase
        .from("appointments")
        .select("*, doctor:profiles!appointments_doctor_id_fkey(full_name, avatar_url, specialization), department:departments(name)")
        .eq("patient_id", userId)
        .gte("appointment_date", today)
        .in("status", ["scheduled", "confirmed"])
        .order("appointment_date", { ascending: true })
        .limit(5);

      setUpcomingAppointments(upcoming || []);

      const { count: totalCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", userId);

      const { count: upcomingCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", userId)
        .gte("appointment_date", today)
        .in("status", ["scheduled", "confirmed"]);

      const { count: completedCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", userId)
        .eq("status", "completed");

      setStats({
        upcoming: upcomingCount || 0,
        total: totalCount || 0,
        completed: completedCount || 0,
      });

      setLoading(false);
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Patient Dashboard" subtitle="Welcome back!" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Patient Dashboard"
        subtitle="Welcome back! Here's your health overview."
        actions={
          <Link
            href="/dashboard/patient/book"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Book Appointment
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Visits</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
          <Link href="/dashboard/patient/appointments" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
            View all
          </Link>
        </div>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} viewAs="patient" />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming appointments.{" "}
                <Link href="/dashboard/patient/book" className="text-brand-600 hover:text-brand-500 dark:text-brand-400">
                  Book one now
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
