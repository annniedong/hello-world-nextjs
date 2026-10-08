"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createPost } from "@/app/create/actions";
import type { Voice } from "@/lib/voices";

const MAX_DIMENSION = 1280;

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

export function CreateForm({ voices }: { voices: Voice[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [voice, setVoice] = useState(voices[0].id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFileChange(selected: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
    setError(null);
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
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="photo" className="text-sm font-medium">
          Photo
        </label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={pending}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Preview of your photo"
            className="mt-2 max-h-72 w-full rounded-lg object-cover"
          />
        )}
      </div>

      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="mb-1 text-sm font-medium">Pick a voice</legend>
        {voices.map((v) => (
          <label
            key={v.id}
            className={`flex cursor-pointer flex-col rounded-lg border p-3 ${
              voice === v.id
                ? "border-black dark:border-white"
                : "border-zinc-200 dark:border-zinc-800"
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
            <span className="font-medium">{v.label}</span>
            <span className="text-sm text-zinc-500">{v.blurb}</span>
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Writing captions… (about 10 seconds)" : "Caption my photo"}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
