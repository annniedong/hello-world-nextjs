import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { safeNext } from "@/lib/safe-next";
import { buttonClass } from "@/lib/ui";
import { getViewer } from "@/lib/viewer";

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

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Your profile
      </h1>
      <p className="mb-6 mt-1 text-muted">{user.email}</p>

      {needsName && (
        <p
          role="status"
          className="mb-5 rounded-2xl border border-border bg-accent/25 p-4 text-sm font-medium"
        >
          Welcome! Add your first and last name to finish setting up.
        </p>
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
        afterSaveHref={needsName ? next : undefined}
      />

      <div className="mt-6 flex justify-center">
        <SignOutButton className={buttonClass("ghost")} />
      </div>
    </main>
  );
}
