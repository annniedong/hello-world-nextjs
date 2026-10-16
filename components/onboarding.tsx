"use client";

import Link from "next/link";
import { useState } from "react";
import { FlameIcon } from "@/components/icons";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Pigeon } from "@/components/pigeon";
import { Skyline } from "@/components/skyline";
import { SubwayBullet } from "@/components/subway-bullet";
import { DEFAULT_GOAL, GOALS, PREF_COOKIES } from "@/lib/prefs-shared";
import { buttonClass } from "@/lib/ui";
import { VOICES } from "@/lib/voices";

const TOTAL_STEPS = 4;

function savePrefs(voiceId: string, goal: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const attrs = `; path=/; max-age=31536000; SameSite=Lax${secure}`;
  document.cookie = `${PREF_COOKIES.onboarded}=1${attrs}`;
  document.cookie = `${PREF_COOKIES.voice}=${encodeURIComponent(voiceId)}${attrs}`;
  document.cookie = `${PREF_COOKIES.goal}=${goal}${attrs}`;
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

export function Onboarding({ next }: { next?: string }) {
  const [step, setStep] = useState(0);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);

  const voice = VOICES.find((v) => v.id === voiceId) ?? VOICES[0];

  function goTo(target: number) {
    if (target === TOTAL_STEPS - 1) savePrefs(voiceId, goal);
    setStep(target);
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-8 pt-5 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          aria-label="Back"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted transition-opacity hover:bg-surface-2 ${
            step === 0 ? "pointer-events-none opacity-0" : ""
          }`}
        >
          <BackIcon />
        </button>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step + 1}
          aria-label="Onboarding progress"
          className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          >
            <div className="mx-2 mt-1 h-1 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      <div key={step} className="flex flex-1 animate-rise flex-col pt-6">
        {step === 0 && (
          <>
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-border bg-surface bg-subway-tiles px-6 py-10 text-center">
              <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-surface-2 opacity-70" />
              <div className="relative">
                <Pigeon size={170} flapping />
              </div>
              <h1 className="relative mt-4 font-display text-4xl font-black tracking-tight">
                Hi, I&apos;m Pidge.
              </h1>
              <p className="relative mt-2 max-w-xs text-lg font-semibold text-muted">
                I&apos;ll help you caption your New York. Let&apos;s set up your
                ride. It takes 30 seconds.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button type="button" onClick={() => goTo(1)} className={`${buttonClass("primary", "lg")} w-full`}>
                Let&apos;s go
              </button>
              <button type="button" onClick={() => goTo(3)} className={`${buttonClass("ghost", "md")} w-full`}>
                I already have an account
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Which line are you?
            </h1>
            <p className="mt-1 text-base font-semibold text-muted">
              Pick the voice for your captions. You can switch any time.
            </p>
            <div role="radiogroup" aria-label="Caption voice" className="mb-8 mt-6 grid gap-3">
              {VOICES.map((v) => {
                const selected = v.id === voiceId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setVoiceId(v.id)}
                    className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:translate-y-0.5 ${
                      selected
                        ? "border-blue bg-blue/10 shadow-[0_4px_0_var(--blue)]"
                        : "border-border bg-surface shadow-[0_4px_0_var(--border)] hover:bg-surface-2"
                    }`}
                  >
                    <SubwayBullet line={v.line} size={48} className={selected ? "animate-wiggle" : ""} />
                    <span className="flex flex-col">
                      <span className="text-lg font-extrabold">{v.label}</span>
                      <span className="text-sm font-semibold text-muted">{v.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => goTo(2)} className={`${buttonClass("primary", "lg")} mt-auto w-full`}>
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Set a daily goal
            </h1>
            <p className="mt-1 text-base font-semibold text-muted">
              Rate photos each day to build a streak. How many feels right?
            </p>
            <div role="radiogroup" aria-label="Daily goal" className="mb-8 mt-6 grid gap-3">
              {GOALS.map((g) => {
                const selected = g.votes === goal;
                return (
                  <button
                    key={g.votes}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setGoal(g.votes)}
                    className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:translate-y-0.5 ${
                      selected
                        ? "border-blue bg-blue/10 shadow-[0_4px_0_var(--blue)]"
                        : "border-border bg-surface shadow-[0_4px_0_var(--border)] hover:bg-surface-2"
                    }`}
                  >
                    <span className="flex w-14 justify-center text-orange">
                      {Array.from({ length: GOALS.findIndex((x) => x.votes === g.votes) + 1 }).map((_, i) => (
                        <FlameIcon key={i} className="-mx-1 h-8 w-8" />
                      ))}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-lg font-extrabold">{g.name}</span>
                      <span className="text-sm font-semibold text-muted">{g.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => goTo(3)} className={`${buttonClass("primary", "lg")} mt-auto w-full`}>
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="relative flex flex-col items-center overflow-hidden rounded-[2rem] border-2 border-border bg-surface bg-subway-tiles px-6 pb-8 pt-8 text-center">
              <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-surface-2" />
              <div className="relative">
                <Pigeon size={130} flapping />
              </div>
              <h1 className="relative mt-3 font-display text-3xl font-black tracking-tight">
                Ready to ride?
              </h1>
              <p className="relative mt-1 max-w-xs text-base font-semibold text-muted">
                Sign in to save your streak and start rating.
              </p>

              <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-background px-3 py-1.5 text-sm font-extrabold">
                  <SubwayBullet line={voice.line} size={22} />
                  {voice.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-background px-3 py-1.5 text-sm font-extrabold">
                  <FlameIcon className="h-4 w-4 text-orange" />
                  {goal} votes a day
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <GoogleSignInButton next={next && next !== "/" ? next : undefined} />
              <Link href="/" className={`${buttonClass("ghost", "md")} w-full`}>
                Just browse for now
              </Link>
            </div>
            <p className="mt-4 text-center text-xs font-semibold text-muted">
              We only use your Google account to sign you in.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
