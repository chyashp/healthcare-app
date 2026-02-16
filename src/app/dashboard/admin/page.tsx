"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Profile, Appointment } from "@/types/database";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, doctors: 0, patients: 0, departments: 0, appointments: 0, todayAppointments: 0 });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const [
        { count: totalUsers },
        { count: doctors },
        { count: patients },
        { count: departments },
        { count: appointments },
        { count: todayAppointments },
        { data: usersData },
        { data: apptsData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "doctor"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
        supabase.from("departments").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("appointment_date", today),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
        supabase
          .from("appointments")
          .select("*, patient:profiles!appointments_patient_id_fkey(full_name, avatar_url), doctor:profiles!appointments_doctor_id_fkey(full_name), department:departments(name)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        doctors: doctors || 0,
        patients: patients || 0,
        departments: departments || 0,
        appointments: appointments || 0,
        todayAppointments: todayAppointments || 0,
      });
      setRecentUsers(usersData || []);
      setRecentAppointments(apptsData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Admin Dashboard" />
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="Admin Dashboard" subtitle="System overview and management" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Doctors</p>
            <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">{stats.doctors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Patients</p>
            <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.patients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
            <p className="mt-1 text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.departments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Appointments</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats.appointments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
            <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">{stats.todayAppointments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h2>
            <Link href="/dashboard/admin/users" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
              View all
            </Link>
          </div>
          <Card>
            <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentUsers.map((user) => (
                <div key={user.user_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Joined {formatDate(user.created_at)}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {user.role}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Appointments</h2>
            <Link href="/dashboard/admin/appointments" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
              View all
            </Link>
          </div>
          <Card>
            <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {appt.patient?.full_name || "Patient"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {appt.doctor?.full_name || "Doctor"} &middot; {appt.department?.name}
                    </p>
                  </div>
                  <Badge status={appt.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
