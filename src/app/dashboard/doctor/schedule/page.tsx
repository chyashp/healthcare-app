"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { classNames } from "@/lib/utils";
import type { DoctorSchedule } from "@/types/database";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScheduleRow {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function DoctorSchedulePage() {
  const { userId } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleRow[]>(
    DAYS.map((_, i) => ({
      day_of_week: i,
      start_time: "09:00",
      end_time: "17:00",
      is_available: i >= 1 && i <= 5,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchSchedule() {
      const supabase = createClient();
      const { data } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", userId);

      if (data && data.length > 0) {
        setSchedule((prev) =>
          prev.map((row) => {
            const match = data.find((d: DoctorSchedule) => d.day_of_week === row.day_of_week);
            return match
              ? { ...row, start_time: match.start_time, end_time: match.end_time, is_available: match.is_available }
              : row;
          })
        );
      }
      setLoading(false);
    }

    fetchSchedule();
  }, [userId]);

  function toggleDay(dayIndex: number) {
    setSchedule((prev) =>
      prev.map((row) =>
        row.day_of_week === dayIndex
          ? { ...row, is_available: !row.is_available }
          : row
      )
    );
  }

  function updateTime(dayIndex: number, field: "start_time" | "end_time", value: string) {
    setSchedule((prev) =>
      prev.map((row) =>
        row.day_of_week === dayIndex ? { ...row, [field]: value } : row
      )
    );
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();

    // Delete existing and re-insert
    await supabase.from("doctor_schedules").delete().eq("doctor_id", userId);

    const rows = schedule
      .filter((s) => s.is_available)
      .map((s) => ({
        doctor_id: userId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_available: true,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from("doctor_schedules").insert(rows);
      if (error) {
        setMessage("Failed to save schedule.");
        setSaving(false);
        return;
      }
    }

    setMessage("Schedule saved successfully!");
    setSaving(false);
  }

  if (loading) {
    return (
      <div>
        <DashboardHeader title="My Schedule" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="My Schedule" subtitle="Set your weekly availability" />

      {message && (
        <div className={classNames(
          "mb-6 rounded-lg p-3 text-sm",
          message.includes("success")
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        )}>
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Availability</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.map((row) => (
              <div
                key={row.day_of_week}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 p-3 dark:border-gray-800"
              >
                <button
                  onClick={() => toggleDay(row.day_of_week)}
                  className={classNames(
                    "w-28 rounded-lg px-3 py-2 text-sm font-medium transition",
                    row.is_available
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                      : "bg-gray-100 text-gray-400 line-through dark:bg-gray-800 dark:text-gray-600"
                  )}
                >
                  {DAYS[row.day_of_week]}
                </button>

                {row.is_available ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={row.start_time}
                      onChange={(e) => updateTime(row.day_of_week, "start_time", e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <span className="text-sm text-gray-400">to</span>
                    <input
                      type="time"
                      value={row.end_time}
                      onChange={(e) => updateTime(row.day_of_week, "end_time", e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Not available</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} loading={saving}>Save Schedule</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
