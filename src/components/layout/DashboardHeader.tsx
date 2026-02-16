"use client";

import { useAuth } from "@/hooks/use-auth";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  actions,
}: DashboardHeaderProps) {
  const { fullName, avatarUrl } = useAuth();

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/30">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName || "Avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-brand-700 dark:text-brand-400">
              {initials}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
