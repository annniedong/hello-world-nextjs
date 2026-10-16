"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

const inputClass =
  "h-11 rounded-xl border border-border bg-surface px-3 text-base placeholder:text-muted";

export function ProfileForm({
  profile,
  afterSaveHref,
}: {
  profile: Profile;
  afterSaveHref?: string;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  function onFileChange(selected: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    let newAvatarUrl = avatarUrl;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file);

      if (uploadError) {
        setMessage({ ok: false, text: `Upload failed: ${uploadError.message}` });
        setSaving(false);
        return;
      }

      newAvatarUrl = supabase.storage.from("avatars").getPublicUrl(path)
        .data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        avatar_url: newAvatarUrl,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      setMessage({ ok: false, text: `Save failed: ${error.message}` });
      return;
    }

    setAvatarUrl(newAvatarUrl);
    setFile(null);
    setMessage({ ok: true, text: "Saved" });
    router.refresh();
    if (afterSaveHref) router.push(afterSaveHref);
  }

  const shownAvatar = previewUrl ?? avatarUrl;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <Avatar url={shownAvatar} name={firstName || "?"} size={80} />
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar" className={`${buttonClass("secondary")} cursor-pointer`}>
            {shownAvatar ? "Change photo" : "Upload photo"}
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
          <span className="text-xs text-muted">
            {file ? `${file.name} selected. Save to apply.` : "JPEG, PNG, WebP, or GIF up to 2 MB."}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">First name</span>
          <input
            className={inputClass}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            placeholder="Sam"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Last name</span>
          <input
            className={inputClass}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            placeholder="Rivera"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={saving}
          className={`${buttonClass("primary", "lg")} w-full`}
        >
          {saving ? "Saving…" : afterSaveHref ? "Save and continue" : "Save changes"}
        </button>
        {message && (
          <p
            role={message.ok ? "status" : "alert"}
            className={`text-sm font-medium ${message.ok ? "text-up" : "text-down"}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
