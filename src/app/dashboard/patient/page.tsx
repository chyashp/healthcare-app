"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";

export default function PatientDashboard() {
  return (
    <div>
      <DashboardHeader
        title="Patient Dashboard"
        subtitle="Welcome back! Here's your health overview."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Patient dashboard content coming soon.
        </p>
      </div>
    </div>
  );
}
