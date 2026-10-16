"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Pigeon } from "@/components/pigeon";
import { SubwayBullet } from "@/components/subway-bullet";
import { lineColors } from "@/lib/subway";
import type { Voice } from "@/lib/voices";

const STAGE_MS = 2600;
const TIP_MS = 4200;
const SLOW_AFTER_MS = 25_000;

const TIPS = [
  "Every caption is written fresh. No reruns.",
  "Rating photos earns XP and keeps your streak alive.",
  "Share your photo's link and get your friends voting.",
  "The express is faster than the local, but not by much.",
];

function Train({ color, textColor }: { color: string; textColor: string }) {
  return (
    <svg width="64" height="34" viewBox="0 0 64 34" aria-hidden className="animate-train drop-shadow-lg">
      <rect x="1" y="3" width="62" height="24" rx="9" fill={color} />
      <rect x="1" y="17" width="62" height="4" fill={textColor} opacity="0.35" />
      {[8, 21, 34, 47].map((x) => (
        <rect key={x} x={x} y="8" width="9" height="8" rx="2" fill="#ffffff" opacity="0.92" />
      ))}
      <circle cx="58" cy="22" r="2" fill="#fff6c2" />
      <circle cx="17" cy="29" r="3.5" fill="#1a1f2b" />
      <circle cx="47" cy="29" r="3.5" fill="#1a1f2b" />
    </svg>
  );
}

function StageIcon({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12 5 5 9-10" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <svg className="h-6 w-6 animate-spin text-yellow" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3.5" opacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }
  return <span className="h-6 w-6 rounded-full border-2 border-white/20" aria-hidden />;
}

export function GeneratingOverlay({
  photoUrl,
  voice,
}: {
  photoUrl: string | null;
  voice: Voice;
}) {
  const stages = [
    "Boarding your photo",
    "Finding the joke",
    `Writing captions as ${voice.label}`,
    "Pulling into the station",
  ];

  const [stage, setStage] = useState(0);
  const [tip, setTip] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const stageTimer = setInterval(
      () => setStage((s) => Math.min(s + 1, stages.length - 1)),
      STAGE_MS,
    );
    const tipTimer = setInterval(() => setTip((t) => (t + 1) % TIPS.length), TIP_MS);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearInterval(stageTimer);
      clearInterval(tipTimer);
      clearTimeout(slowTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [stages.length]);

  const { background, color } = lineColors(voice.line);
  const progress = (stage / (stages.length - 1)) * 100;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generating your captions"
      className="fixed inset-0 z-[60] flex animate-pop items-center justify-center overflow-y-auto bg-night p-6 text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.045) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.045) 2px, transparent 2px)",
        backgroundSize: "64px 32px",
      }}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-5 py-4 text-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-black px-4 py-2.5">
          <SubwayBullet line={voice.line} size={30} />
          <span className="text-lg font-extrabold tracking-wide">Next stop: Captions</span>
        </div>

        <div className="relative h-44 w-44 overflow-hidden rounded-[1.75rem] border-4 border-white/15 bg-white/5 shadow-2xl">
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-yellow/45 to-transparent" />
          <span className="absolute left-3 top-3 h-5 w-5 rounded-tl-lg border-l-4 border-t-4 border-yellow" />
          <span className="absolute right-3 top-3 h-5 w-5 rounded-tr-lg border-r-4 border-t-4 border-yellow" />
          <span className="absolute bottom-3 left-3 h-5 w-5 rounded-bl-lg border-b-4 border-l-4 border-yellow" />
          <span className="absolute bottom-3 right-3 h-5 w-5 rounded-br-lg border-b-4 border-r-4 border-yellow" />
        </div>

        <div className="relative w-full px-8 pt-12">
          <div className="absolute -top-2 right-4">
            <Pigeon size={64} flapping bobbing={false} />
          </div>

          <div className="relative h-2 rounded-full bg-white/15">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-[2200ms] ease-in-out"
              style={{ width: `${progress}%`, background }}
            />
            {stages.map((_, index) => (
              <span
                key={index}
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-night transition-colors duration-500"
                style={{
                  left: `${(index / (stages.length - 1)) * 100}%`,
                  background: index <= stage ? background : "#4a5568",
                }}
              />
            ))}
            <div
              className="absolute -top-[27px] -translate-x-1/2 transition-[left] duration-[2200ms] ease-in-out"
              style={{ left: `${progress}%` }}
            >
              <Train color={background} textColor={color} />
            </div>
          </div>
        </div>

        <ol className="w-full space-y-1.5 text-left">
          {stages.map((label, index) => {
            const state = index < stage ? "done" : index === stage ? "active" : "pending";
            return (
              <li
                key={label}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2 transition-colors duration-300 ${
                  state === "active" ? "bg-white/10" : ""
                }`}
              >
                <StageIcon state={state} />
                <span
                  className={`text-base font-bold transition-colors duration-300 ${
                    state === "pending" ? "text-white/35" : state === "done" ? "text-white/60" : "text-white"
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <p role="status" aria-live="polite" className="sr-only">
          {stages[stage]}
        </p>

        <div className="min-h-10 max-w-xs">
          {slow ? (
            <p className="animate-rise text-sm font-semibold text-yellow">
              Taking a little longer than usual. Hang tight, we&apos;ll tell you if
              something goes wrong.
            </p>
          ) : (
            <p key={tip} className="animate-rise text-sm font-semibold text-white/60">
              {TIPS[tip]}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
