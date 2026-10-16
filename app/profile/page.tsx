import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { getPrefs } from "@/lib/prefs";
import { safeNext } from "@/lib/safe-next";
import { buttonClass } from "@/lib/ui";
import { getViewer } from "@/lib/viewer";
import { getVoice } from "@/lib/voices";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your profile" };

export default async function ProfilePage(props: PageProps<"/profile">) {
  const { next: rawNext } = await props.searchParams;
  const next = safeNext(typeof rawNext === "string" ? rawNext : undefined);

  const { supabase, user } = await getViewer();

  if (!user) {
    redirect("/login?next=%2Fprofile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

  const needsName = !profile?.first_name || !profile?.last_name;
  const { voiceId, goal } = await getPrefs();
  const voice = voiceId ? getVoice(voiceId) : undefined;

  // Google hands us a name and photo; use them to make the first step one tap.
  const meta = user.user_metadata as Record<string, string | undefined>;
  const fullName = (meta.full_name ?? meta.name ?? "").trim();
  const [fallbackFirst = "", ...rest] = fullName.split(/\s+/);
  const defaults = {
    firstName: meta.given_name ?? fallbackFirst,
    lastName: meta.family_name ?? rest.join(" "),
    avatarUrl: meta.avatar_url ?? meta.picture,
  };

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6 sm:py-10">
      {!needsName && (
        <>
          <h1 className="font-display text-4xl font-black tracking-tight">
            Your profile
          </h1>
          <p className="mb-6 mt-1 font-semibold text-muted">{user.email}</p>
        </>
      )}

      <ProfileForm
        profile={
          profile ?? {
            id: user.id,
            first_name: null,
            last_name: null,
            avatar_url: null,
          }
        }
        onboarding={needsName}
        defaults={needsName ? defaults : undefined}
        next={next}
        voice={voice ? { label: voice.label, line: voice.line } : undefined}
        goal={goal}
      />

      {!needsName && (
        <div className="mt-6 flex justify-center">
          <SignOutButton className={buttonClass("ghost")} />
        </div>
      )}
    </main>
  );
}
