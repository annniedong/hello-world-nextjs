"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CaptionError, generateCaptions } from "@/lib/gemini";
import { buildPrompt, getVoice } from "@/lib/voices";

const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const DAILY_LIMIT = 10;

export async function createPost(
  formData: FormData,
): Promise<{ error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Please sign in to add a photo." };
  }

  const photo = formData.get("photo");
  const voice = getVoice(String(formData.get("voice") ?? ""));
  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "Choose a photo first." };
  }
  if (!voice) {
    return { error: "Pick a voice for the captions." };
  }
  const extension = EXTENSIONS[photo.type];
  if (!extension) {
    return { error: "Photos must be JPEG, PNG, or WebP." };
  }
  if (photo.size > MAX_BYTES) {
    return { error: "That photo is too large (2 MB max)." };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("images")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return {
      error: `You've hit today's limit of ${DAILY_LIMIT} photos. Come back tomorrow.`,
    };
  }

  const bytes = Buffer.from(await photo.arrayBuffer());
  const prompt = buildPrompt(voice);

  let result;
  try {
    result = await generateCaptions({ bytes, mimeType: photo.type, prompt });
  } catch (error) {
    if (error instanceof CaptionError && error.kind === "rate_limit") {
      return { error: "The caption writer is busy. Try again in a minute." };
    }
    if (error instanceof CaptionError && error.kind === "not_configured") {
      return { error: "Captioning isn't set up on this server yet." };
    }
    return { error: "Couldn't write captions this time. Try again." };
  }

  if (!result.safe || result.captions.length === 0) {
    return { error: "That photo can't be captioned. Try a different one." };
  }

  const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(storagePath, bytes, { contentType: photo.type });
  if (uploadError) {
    console.error("Photo upload failed", uploadError);
    return { error: "Couldn't save your photo. Try again." };
  }

  const { data: image, error: imageError } = await supabase
    .from("images")
    .insert({ user_id: user.id, storage_path: storagePath })
    .select("id")
    .single();
  if (imageError || !image) {
    console.error("Image insert failed", imageError);
    return { error: "Couldn't save your photo. Try again." };
  }

  const { error: captionsError } = await supabase.from("captions").insert(
    result.captions.map((content) => ({
      image_id: image.id,
      created_by: user.id,
      content,
      style: voice.id,
      prompt,
      model: result.model,
    })),
  );
  if (captionsError) {
    console.error("Caption insert failed", captionsError);
    return { error: "Couldn't save the captions. Try again." };
  }

  revalidatePath("/");
  redirect(`/image/${image.id}`);
}
