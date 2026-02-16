"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import type { Department } from "@/types/database";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    const supabase = createClient();
    const { data } = await supabase.from("departments").select("*").order("name");
    setDepartments(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditingDept(null);
    setName("");
    setDescription("");
    setIcon("");
    setShowForm(true);
  }

  function openEdit(dept: Department) {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    setIcon(dept.icon || "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    if (editingDept) {
      await supabase
        .from("departments")
        .update({ name, description: description || null, icon: icon || null })
        .eq("id", editingDept.id);
    } else {
      await supabase
        .from("departments")
        .insert({ name, description: description || null, icon: icon || null });
    }

    setShowForm(false);
    setSubmitting(false);
    fetchDepartments();
  }

  async function handleDelete(deptId: string) {
    const supabase = createClient();
    await supabase.from("departments").delete().eq("id", deptId);
    fetchDepartments();
  }

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Departments" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Departments"
        subtitle="Manage hospital departments"
        actions={<Button onClick={openAdd}>Add Department</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardContent className="py-5">
              <div className="flex items-start justify-between">
                <div>
                  {dept.icon && <span className="mb-2 block text-2xl">{dept.icon}</span>}
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                  {dept.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{dept.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(dept)}
                    className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="rounded p-1 text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No departments yet. Add one to get started.</p>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingDept ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="deptName" label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Cardiology" />
          <div>
            <label htmlFor="deptDesc" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="deptDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Brief description..."
            />
          </div>
          <Input id="deptIcon" label="Icon (emoji)" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., ❤️" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingDept ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
