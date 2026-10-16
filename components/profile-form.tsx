"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Confetti } from "@/components/confetti";
import { FlameIcon, StarIcon } from "@/components/icons";
import { Pigeon } from "@/components/pigeon";
import { SubwayBullet } from "@/components/subway-bullet";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type Defaults = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

const inputClass =
  "h-12 rounded-2xl border-2 border-border bg-surface px-4 text-base font-semibold placeholder:text-muted focus-visible:border-blue";

export function ProfileForm({
  profile,
  onboarding = false,
  defaults,
  next = "/",
  voice,
  goal,
}: {
  profile: Profile;
  onboarding?: boolean;
  defaults?: Defaults;
  next?: string;
  voice?: { label: string; line: string };
  goal?: number;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(
    profile.first_name ?? defaults?.firstName ?? "",
  );
  const [lastName, setLastName] = useState(
    profile.last_name ?? defaults?.lastName ?? "",
  );
  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatar_url ?? defaults?.avatarUrl ?? null,
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
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
    router.refresh();

    if (onboarding) {
      setDone(true);
      return;
    }
    setMessage({ ok: true, text: "Saved" });
  }

  const shownAvatar = previewUrl ?? avatarUrl;

  if (onboarding && done) {
    return (
      <div className="flex animate-pop flex-col items-center rounded-[2rem] border-2 border-border bg-surface px-6 py-10 text-center">
        <Confetti />
        <Pigeon size={140} flapping />
        <h2 className="mt-3 font-display text-4xl font-black tracking-tight">
          You&apos;re all set, {firstName.trim() || "New Yorker"}!
        </h2>
        <p className="mt-1 font-semibold text-muted">
          Welcome aboard. Here&apos;s where you start.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-background px-3 py-1.5 text-sm font-extrabold">
            <StarIcon className="h-4 w-4 text-yellow-dark" />
            Level 1 · Tourist
          </span>
          {voice && (
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-background px-3 py-1.5 text-sm font-extrabold">
              <SubwayBullet line={voice.line} size={20} />
              {voice.label}
            </span>
          )}
          {goal && (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-background px-3 py-1.5 text-sm font-extrabold">
              <FlameIcon className="h-4 w-4 text-orange" />
              {goal} votes a day
            </span>
          )}
        </div>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Link href={next === "/" ? "/vote" : next} className={`${buttonClass("primary", "lg")} w-full`}>
            {next === "/" ? "Start rating" : "Continue"}
          </Link>
          <Link href="/create" className={`${buttonClass("secondary", "lg")} w-full`}>
            Add your first photo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-[2rem] border-2 border-border bg-surface p-6"
    >
      {onboarding && (
        <div className="-mb-1 flex items-center gap-4">
          <Pigeon size={84} flapping bobbing={false} />
          <div>
            <p className="font-display text-2xl font-black leading-tight">
              Welcome aboard{firstName.trim() ? `, ${firstName.trim()}` : ""}!
            </p>
            <p className="text-sm font-semibold text-muted">
              Is this you? Tweak anything you like.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Avatar url={shownAvatar} name={firstName || "?"} size={84} />
        <div className="flex flex-col gap-1.5">
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
          <span className="text-xs font-semibold text-muted">
            {file
              ? `${file.name} selected. Save to apply.`
              : "JPEG, PNG, WebP, or GIF up to 2 MB."}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-extrabold">First name</span>
          <input
            className={inputClass}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            placeholder="Sam"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-extrabold">Last name</span>
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
          disabled={saving || (onboarding && (!firstName.trim() || !lastName.trim()))}
          className={`${buttonClass("primary", "lg")} w-full`}
        >
          {saving ? "Saving…" : onboarding ? "Board the train" : "Save changes"}
        </button>
        {message && (
          <p
            role={message.ok ? "status" : "alert"}
            className={`text-sm font-extrabold ${message.ok ? "text-primary" : "text-danger"}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
