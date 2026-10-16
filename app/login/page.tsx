import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Logo } from "@/components/logo";
import { safeNext } from "@/lib/safe-next";
import { getViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

function reasonFor(next: string) {
  if (next.startsWith("/create")) return "add a photo and get captions";
  if (next.startsWith("/dashboard") || next.startsWith("/profile")) {
    return "see your photos and profile";
  }
  return "vote on captions";
}

export default async function LoginPage(props: PageProps<"/login">) {
  const { next: rawNext, error } = await props.searchParams;
  const next = safeNext(typeof rawNext === "string" ? rawNext : undefined);

  const { user } = await getViewer();
  if (user) {
    redirect(next);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Sign in to {reasonFor(next)}
        </h1>
        <p className="mt-2 text-muted">
          Browsing is open to everyone. An account lets you vote and post.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-down/10 p-3 text-sm font-medium text-down">
            Sign-in didn&apos;t finish. Please try again.
          </p>
        )}

        <div className="mt-6">
          <GoogleSignInButton next={next === "/" ? undefined : next} />
        </div>
        <p className="mt-4 text-xs text-muted">
          We only use your Google account to sign you in.
        </p>
      </div>
    </main>
  );
}
