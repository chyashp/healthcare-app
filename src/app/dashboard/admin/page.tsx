"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";

export default function AdminDashboard() {
  return (
    <div>
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="System overview and management."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Admin dashboard content coming soon.
        </p>
      </div>
    </div>
  );
}
