"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { classNames, formatDate } from "@/lib/utils";
import type { Profile } from "@/types/database";

const ROLE_FILTERS = [
  { key: "all", label: "All" },
  { key: "patient", label: "Patients" },
  { key: "doctor", label: "Doctors" },
  { key: "admin", label: "Admins" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setUsers(data || []);
      setLoading(false);
    }

    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !(u.full_name || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div>
        <DashboardHeader title="User Management" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="User Management" subtitle="View and manage all registered users" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setRoleFilter(filter.key)}
              className={classNames(
                "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition",
                roleFilter === filter.key
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input
            id="search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Phone</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((user) => (
                  <tr key={user.user_id}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                          {user.specialization && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.specialization}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={classNames(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" :
                        user.role === "doctor" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {user.phone || "—"}
                    </td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((user) => (
              <div key={user.user_id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(user.created_at)}</p>
                </div>
                <span className={classNames(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" :
                  user.role === "doctor" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400" :
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                )}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
