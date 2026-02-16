"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { classNames } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { userId } = useAuth();
  const { theme, setTheme, mounted } = useTheme();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setAvatarUrl(profile.avatar_url);
      }
    }

    fetchProfile();
  }, [userId]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      setMessage({ type: "error", text: "Failed to upload avatar." });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", userId);
    setAvatarUrl(urlData.publicUrl);
    setUploading(false);
    setMessage({ type: "success", text: "Avatar updated!" });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("user_id", userId);

    setMessage(error ? { type: "error", text: "Failed to save." } : { type: "success", text: "Profile updated!" });
    setSaving(false);
  }

  return (
    <div>
      <DashboardHeader title="Settings" subtitle="Manage your admin profile" />

      {message && (
        <div className={classNames(
          "mb-6 rounded-lg p-3 text-sm",
          message.type === "success"
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        )}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Profile Photo</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar src={avatarUrl} name={fullName} size="lg" />
            <label className="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              {uploading ? "Uploading..." : "Change Photo"}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
            </label>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Profile Information</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <Input id="fullName" label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <Input id="phone" label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <div className="flex justify-end">
                  <Button type="submit" loading={saving}>Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {mounted && (
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme("light")}
                className={classNames(
                  "rounded-lg border-2 px-6 py-3 text-sm font-medium transition",
                  theme === "light"
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                    : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={classNames(
                  "rounded-lg border-2 px-6 py-3 text-sm font-medium transition",
                  theme === "dark"
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                    : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                Dark
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
