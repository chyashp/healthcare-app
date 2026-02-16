"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { setSidebarOpen } from "@/store/slices/ui";
import { createClient } from "@/lib/supabase/client";
import { classNames } from "@/lib/utils";
import type { UserRole } from "@/types/database";

function getNavItems(role: UserRole) {
  const base = `/dashboard/${role}`;

  if (role === "patient") {
    return [
      { name: "Overview", href: base },
      { name: "Book Appointment", href: `${base}/book` },
      { name: "My Appointments", href: `${base}/appointments` },
      { name: "Medical Records", href: `${base}/records` },
      { name: "Video Consultation", href: `${base}/consultation` },
      { name: "Settings", href: `${base}/settings` },
    ];
  }

  if (role === "doctor") {
    return [
      { name: "Overview", href: base },
      { name: "My Schedule", href: `${base}/schedule` },
      { name: "Appointments", href: `${base}/appointments` },
      { name: "Patient Records", href: `${base}/records` },
      { name: "Video Consultation", href: `${base}/consultation` },
      { name: "Settings", href: `${base}/settings` },
    ];
  }

  return [
    { name: "Overview", href: base },
    { name: "Users", href: `${base}/users` },
    { name: "Departments", href: `${base}/departments` },
    { name: "All Appointments", href: `${base}/appointments` },
    { name: "Settings", href: `${base}/settings` },
  ];
}

export default function MobileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { role, fullName } = useAuth();
  const { toggleTheme, mounted, theme } = useTheme();

  const navItems = getNavItems(role || "patient");

  function close() {
    dispatch(setSidebarOpen(false));
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    close();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile header bar */}
      <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <button
          onClick={() => dispatch(setSidebarOpen(true))}
          className="text-gray-500 dark:text-gray-400"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500">
            <span className="text-xs font-bold text-white">H</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            HealthConnect
          </span>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={close}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar p-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
                  <span className="text-sm font-bold text-white">H</span>
                </div>
                <span className="font-bold text-white">HealthConnect</span>
              </div>
              <button onClick={close} className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <span className="mb-4 inline-flex items-center rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-400">
              {role || "patient"}
            </span>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== `/dashboard/${role}` &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={close}
                    className={classNames(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-brand-500/10 text-brand-400"
                        : "text-gray-400 hover:bg-sidebar-hover hover:text-white"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-gray-800 pt-4">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition hover:bg-sidebar-hover hover:text-white"
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              )}
              <div className="mt-1 flex items-center justify-between px-3 py-2">
                <span className="truncate text-sm text-gray-400">
                  {fullName || "User"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-red-400"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
