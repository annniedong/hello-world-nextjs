import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Onboarding } from "@/components/onboarding";
import { Pigeon } from "@/components/pigeon";
import { Skyline } from "@/components/skyline";
import { getPrefs } from "@/lib/prefs";
import { safeNext } from "@/lib/safe-next";
import { buttonClass } from "@/lib/ui";
import { getViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

function reasonFor(next: string) {
  if (next.startsWith("/create")) return "add a photo";
  if (next.startsWith("/dashboard") || next.startsWith("/profile")) {
    return "see your profile";
  }
  return "vote on captions";
}

export default async function LoginPage(props: PageProps<"/login">) {
  const { next: rawNext, error, intro } = await props.searchParams;
  const next = safeNext(typeof rawNext === "string" ? rawNext : undefined);

  const { user } = await getViewer();
  if (user) {
    redirect(next);
  }

  const { onboarded } = await getPrefs();

  // First-time visitors get the guided intro; returning visitors get a quick sign-in.
  if (!onboarded || intro) {
    return <Onboarding next={next} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-border bg-surface bg-subway-tiles p-8 text-center">
        <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-surface-2" />
        <div className="relative flex justify-center">
          <Pigeon size={120} flapping />
        </div>
        <h1 className="relative mt-2 font-display text-3xl font-black tracking-tight">
          Welcome back
        </h1>
        <p className="relative mt-1 font-semibold text-muted">
          Sign in to {reasonFor(next)}.
        </p>

        {error && (
          <p
            role="alert"
            className="relative mt-4 animate-wiggle rounded-2xl border-2 border-danger/40 bg-danger/10 p-3 text-sm font-bold text-danger"
          >
            Sign-in didn&apos;t finish. Please try again.
          </p>
        )}

        <div className="relative mt-6">
          <GoogleSignInButton next={next === "/" ? undefined : next} />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 text-center">
        <Link
          href={`/login?intro=1&next=${encodeURIComponent(next)}`}
          className={buttonClass("ghost")}
        >
          New here? Take the tour
        </Link>
        <p className="text-xs font-semibold text-muted">
          We only use your Google account to sign you in.
        </p>
      </div>
    </main>
  );
}
