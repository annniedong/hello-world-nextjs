"use client";

import { useState, useTransition, type DragEvent, type FormEvent } from "react";
import { createPost } from "@/app/create/actions";
import { GeneratingOverlay } from "@/components/generating-overlay";
import { CameraIcon } from "@/components/icons";
import { Pigeon } from "@/components/pigeon";
import { SubwayBullet } from "@/components/subway-bullet";
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

function StepBadge({ n }: { n: number }) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-blue text-sm font-black text-white shadow-[0_3px_0_var(--blue-dark)]">
      {n}
    </span>
  );
}

export function CreateForm({
  voices,
  defaultVoiceId,
}: {
  voices: Voice[];
  defaultVoiceId?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState(
    voices.some((v) => v.id === defaultVoiceId) ? defaultVoiceId! : voices[0].id,
  );
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const voice = voices.find((v) => v.id === voiceId) ?? voices[0];

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
        formData.set("voice", voice.id);
        const result = await createPost(formData);
        if (result?.error) setError(result.error);
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  }

  return (
    <>
      {pending && <GeneratingOverlay photoUrl={previewUrl} voice={voice} />}

      <form onSubmit={onSubmit} className="flex flex-col gap-10">
        <section aria-labelledby="step-photo">
          <h2
            id="step-photo"
            className="mb-4 flex items-center gap-3 font-display text-xl font-black"
          >
            <StepBadge n={1} />
            Choose a photo
          </h2>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className="rounded-3xl focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-blue"
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
              <div className="animate-pop relative overflow-hidden rounded-3xl border-2 border-border bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview of your photo"
                  className="mx-auto max-h-96 w-full object-contain"
                />
                <label
                  htmlFor="photo"
                  className={`${buttonClass("secondary")} absolute right-3 top-3 cursor-pointer`}
                >
                  Change
                </label>
              </div>
            ) : (
              <label
                htmlFor="photo"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
                  dragging
                    ? "scale-[1.01] border-blue bg-blue/10"
                    : "border-border bg-surface hover:border-blue hover:bg-blue/5"
                }`}
              >
                <Pigeon size={96} />
                <span className="mt-1 flex items-center gap-2 text-xl font-black">
                  <CameraIcon className="h-5 w-5" />
                  Pick a photo
                </span>
                <span className="text-sm font-semibold text-muted">
                  Pidge is hungry for photos. Tap here or drag one in.
                </span>
              </label>
            )}
          </div>
        </section>

        <fieldset disabled={pending} aria-labelledby="step-voice">
          <legend
            id="step-voice"
            className="mb-4 flex items-center gap-3 font-display text-xl font-black"
          >
            <StepBadge n={2} />
            Pick your line
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {voices.map((v) => {
              const selected = voiceId === v.id;
              return (
                <label
                  key={v.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-all focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-blue ${
                    selected
                      ? "border-blue bg-blue/10 shadow-[0_4px_0_var(--blue)]"
                      : "border-border bg-surface shadow-[0_4px_0_var(--border)] hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="voice"
                    value={v.id}
                    checked={selected}
                    onChange={() => setVoiceId(v.id)}
                    className="sr-only"
                  />
                  <SubwayBullet
                    line={v.line}
                    size={40}
                    className={selected ? "animate-wiggle" : ""}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-extrabold">{v.label}</span>
                    <span className="text-sm font-semibold text-muted">{v.blurb}</span>
                    <span className="mt-1 text-sm italic text-foreground/80">
                      {v.example}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={pending}
            className={`${buttonClass("primary", "lg")} w-full`}
          >
            Write my captions
          </button>
          {error && (
            <p
              role="alert"
              className="animate-wiggle rounded-2xl border-2 border-danger/40 bg-danger/10 p-3 text-sm font-bold text-danger"
            >
              {error}
            </p>
          )}
        </div>
      </form>
    </>
  );
}
