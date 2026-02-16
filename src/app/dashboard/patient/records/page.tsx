"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import type { MedicalRecord } from "@/types/database";

export default function PatientRecordsPage() {
  const { userId } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchRecords() {
      const supabase = createClient();
      const { data } = await supabase
        .from("medical_records")
        .select("*, doctor:profiles!medical_records_doctor_id_fkey(full_name, avatar_url, specialization)")
        .eq("patient_id", userId)
        .order("created_at", { ascending: false });

      setRecords(data || []);
      setLoading(false);
    }

    fetchRecords();
  }, [userId]);

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Medical Records" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="Medical Records" subtitle="Your visit history and diagnoses" />

      {records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id}>
              <CardContent>
                <button
                  onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                  className="flex w-full items-start justify-between text-left"
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={record.doctor?.avatar_url} name={record.doctor?.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.diagnosis}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {record.doctor?.full_name} · {formatDate(record.created_at)}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 shrink-0 text-gray-400 transition ${expandedId === record.id ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {expandedId === record.id && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                    {record.prescription && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Prescription</p>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{record.prescription}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</p>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{record.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No medical records"
          description="Your medical records will appear here after your appointments."
        />
      )}
    </div>
  );
}
