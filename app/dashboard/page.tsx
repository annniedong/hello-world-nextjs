import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}!
      </h1>
      <p className="mt-4 text-zinc-500">
        This page only renders for signed-in users. Signed-in email:{" "}
        {user.email}
      </p>
    </main>
  );
}
