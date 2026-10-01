import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

  const needsName = !profile?.first_name || !profile?.last_name;

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Profile</h1>
      {needsName && (
        <p className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Please add your first and last name.
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
      />
    </main>
  );
}
