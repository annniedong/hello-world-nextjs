"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/icons";
import { buttonClass } from "@/lib/ui";

export function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: "NYC Captions", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The user dismissed the share sheet, or the clipboard is unavailable.
    }
  }

  return (
    <button type="button" onClick={share} className={buttonClass("secondary")}>
      <ShareIcon className="h-4 w-4" />
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
