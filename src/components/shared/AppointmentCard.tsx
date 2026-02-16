"use client";

import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/types/database";

interface AppointmentCardProps {
  appointment: Appointment;
  viewAs: "patient" | "doctor";
  onAction?: (action: string, appointment: Appointment) => void;
}

export default function AppointmentCard({
  appointment,
  viewAs,
  onAction,
}: AppointmentCardProps) {
  const otherPerson =
    viewAs === "patient" ? appointment.doctor : appointment.patient;
  const otherLabel = viewAs === "patient" ? "Doctor" : "Patient";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={otherPerson?.avatar_url}
            name={otherPerson?.full_name}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {otherPerson?.full_name || `Unknown ${otherLabel}`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {appointment.department?.name || "General"}
              {otherPerson?.specialization &&
                ` · ${otherPerson.specialization}`}
            </p>
          </div>
        </div>
        <Badge status={appointment.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          {formatDate(appointment.appointment_date)}
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(appointment.start_time)}
        </span>
        <span className="flex items-center gap-1">
          {appointment.type === "video" ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          )}
          {appointment.type === "video" ? "Video" : "In-person"}
        </span>
      </div>

      {appointment.reason && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {appointment.reason}
        </p>
      )}

      {onAction && (
        <div className="mt-3 flex gap-2">
          {appointment.status === "scheduled" && viewAs === "patient" && (
            <button
              onClick={() => onAction("cancel", appointment)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Cancel
            </button>
          )}
          {appointment.status === "scheduled" && viewAs === "doctor" && (
            <button
              onClick={() => onAction("confirm", appointment)}
              className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
            >
              Confirm
            </button>
          )}
          {appointment.status === "confirmed" && viewAs === "doctor" && (
            <button
              onClick={() => onAction("start", appointment)}
              className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
            >
              Start
            </button>
          )}
          {appointment.status === "in_progress" && viewAs === "doctor" && (
            <button
              onClick={() => onAction("complete", appointment)}
              className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-600"
            >
              Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
