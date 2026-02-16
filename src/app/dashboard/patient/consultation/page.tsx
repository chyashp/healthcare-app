"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VideoConsultation from "@/components/shared/VideoConsultation";
import { Card, CardContent } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/types/database";

export default function PatientConsultationPage() {
  const { userId } = useAuth();
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [videoAppointments, setVideoAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function fetchVideoAppointments() {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const { data } = await supabase
        .from("appointments")
        .select("*, doctor:profiles!appointments_doctor_id_fkey(full_name, avatar_url), department:departments(name)")
        .eq("patient_id", userId)
        .eq("type", "video")
        .in("status", ["scheduled", "confirmed", "in_progress"])
        .gte("appointment_date", today)
        .order("appointment_date", { ascending: true });

      setVideoAppointments(data || []);
      setLoading(false);
    }

    fetchVideoAppointments();
  }, [userId]);

  function handleJoinCall(appointment: Appointment) {
    setActiveAppointment(appointment);
    setInCall(true);
  }

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Video Consultation" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (inCall && activeAppointment) {
    return (
      <div>
        <DashboardHeader
          title="Video Consultation"
          subtitle={`With ${activeAppointment.doctor?.full_name || "Doctor"}`}
          actions={
            <Button variant="outline" onClick={() => setInCall(false)}>
              Back to List
            </Button>
          }
        />
        <VideoConsultation
          participantName={activeAppointment.doctor?.full_name || "Doctor"}
          participantAvatar={activeAppointment.doctor?.avatar_url}
          participantRole="doctor"
          appointmentDetails={{
            date: formatDate(activeAppointment.appointment_date),
            time: `${formatTime(activeAppointment.start_time)} - ${formatTime(activeAppointment.end_time)}`,
            department: activeAppointment.department?.name,
            reason: activeAppointment.reason || undefined,
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Video Consultation"
        subtitle="Join a video call with your doctor"
      />

      {videoAppointments.length > 0 ? (
        <div className="space-y-3">
          {videoAppointments.map((appt) => (
            <Card key={appt.id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {appt.doctor?.full_name || "Doctor"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {appt.department?.name} &middot; {formatDate(appt.appointment_date)} at{" "}
                      {formatTime(appt.start_time)}
                    </p>
                    {appt.reason && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {appt.reason}
                      </p>
                    )}
                  </div>
                  <Button size="sm" onClick={() => handleJoinCall(appt)}>
                    Join Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No video consultations"
          description="You don't have any upcoming video consultations. Book a video appointment to get started."
        />
      )}
    </div>
  );
}
