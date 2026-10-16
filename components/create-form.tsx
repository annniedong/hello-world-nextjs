"use client";

import { useState, useTransition, type DragEvent, type FormEvent } from "react";
import { createPost } from "@/app/create/actions";
import { CameraIcon } from "@/components/icons";
import { buttonClass } from "@/lib/ui";
import type { Voice } from "@/lib/voices";

const MAX_DIMENSION = 1280;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function downscale(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Could not process image");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function CreateForm({ voices }: { voices: Voice[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [voice, setVoice] = useState(voices[0].id);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFileChange(selected: File | null) {
    if (selected && !ALLOWED_TYPES.includes(selected.type)) {
      setError("Photos must be JPEG, PNG, or WebP.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
    setError(null);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!pending) onFileChange(event.dataTransfer.files?.[0] ?? null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a photo first.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("photo", await downscale(file));
        formData.set("voice", voice);
        const result = await createPost(formData);
        if (result?.error) setError(result.error);
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <section aria-labelledby="step-photo">
        <h2 id="step-photo" className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-xs text-background">1</span>
          Choose a photo
        </h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foreground"
        >
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="sr-only"
          />

          {previewUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview of your photo"
                className="mx-auto max-h-96 w-full object-contain"
              />
              {!pending && (
                <label
                  htmlFor="photo"
                  className={`${buttonClass("secondary")} absolute right-3 top-3 cursor-pointer shadow-sm`}
                >
                  Change photo
                </label>
              )}
            </div>
          ) : (
            <label
              htmlFor="photo"
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                dragging
                  ? "border-foreground bg-surface-2"
                  : "border-border bg-surface hover:bg-surface-2"
              }`}
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <CameraIcon className="h-7 w-7" />
              </span>
              <span className="mt-1 text-lg font-semibold">Choose a photo</span>
              <span className="text-sm text-muted">
                or drag one here. JPEG, PNG, or WebP.
              </span>
            </label>
          )}
        </div>
      </section>

      <fieldset disabled={pending} aria-labelledby="step-voice">
        <legend id="step-voice" className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-xs text-background">2</span>
          Pick a voice
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {voices.map((v) => (
            <label
              key={v.id}
              className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foreground ${
                voice === v.id
                  ? "border-foreground bg-surface shadow-sm"
                  : "border-border bg-surface hover:bg-surface-2"
              }`}
            >
              <input
                type="radio"
                name="voice"
                value={v.id}
                checked={voice === v.id}
                onChange={() => setVoice(v.id)}
                className="sr-only"
              />
              <span className="flex items-center gap-2 font-semibold">
                <span
                  className={`h-3 w-3 rounded-full border ${
                    voice === v.id ? "border-foreground bg-accent" : "border-border"
                  }`}
                  aria-hidden
                />
                {v.label}
              </span>
              <span className="text-sm text-muted">{v.blurb}</span>
              <span className="mt-1 text-sm italic">{v.example}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={pending}
          className={`${buttonClass("primary", "lg")} w-full`}
        >
          {pending ? (
            <>
              <Spinner />
              Writing captions…
            </>
          ) : (
            "Write my captions"
          )}
        </button>
        {pending && (
          <p role="status" className="text-center text-sm text-muted">
            Reading your photo and writing three captions. This takes about 10
            seconds.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-down/10 p-3 text-sm font-medium text-down">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
