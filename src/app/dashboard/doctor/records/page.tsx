"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import type { MedicalRecord, Profile } from "@/types/database";

export default function DoctorRecordsPage() {
  const { userId } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  async function fetchData() {
    const supabase = createClient();

    const { data: recordsData } = await supabase
      .from("medical_records")
      .select("*, patient:profiles!medical_records_patient_id_fkey(full_name, avatar_url)")
      .eq("doctor_id", userId)
      .order("created_at", { ascending: false });

    setRecords(recordsData || []);

    // Get unique patients from appointments
    const { data: appts } = await supabase
      .from("appointments")
      .select("patient_id, patient:profiles!appointments_patient_id_fkey(user_id, full_name, avatar_url)")
      .eq("doctor_id", userId)
      .eq("status", "completed");

    if (appts) {
      const uniquePatients = new Map<string, Profile>();
      appts.forEach((a) => {
        if (a.patient && !uniquePatients.has(a.patient_id)) {
          uniquePatients.set(a.patient_id, a.patient as unknown as Profile);
        }
      });
      setPatients(Array.from(uniquePatients.values()));
    }

    setLoading(false);
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !selectedPatient) return;

    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from("medical_records").insert({
      patient_id: selectedPatient,
      doctor_id: userId,
      diagnosis,
      prescription: prescription || null,
      notes: notes || null,
    });

    if (!error) {
      setShowForm(false);
      setDiagnosis("");
      setPrescription("");
      setNotes("");
      setSelectedPatient("");
      fetchData();
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Patient Records" />
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
      <DashboardHeader
        title="Patient Records"
        subtitle="View and create medical records"
        actions={
          <Button onClick={() => setShowForm(true)}>Add Record</Button>
        }
      />

      {records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar src={record.patient?.avatar_url} name={record.patient?.full_name} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.patient?.full_name || "Unknown Patient"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(record.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                      </p>
                      {record.prescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Rx:</span> {record.prescription}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No records yet" description="Medical records you create will appear here." />
      )}

      {/* Add Record Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Medical Record">
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis</label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Primary diagnosis..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Prescription</label>
            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Medications and dosage..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
