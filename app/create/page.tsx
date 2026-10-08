import { redirect } from "next/navigation";
import { CreateForm } from "@/components/create-form";
import { createClient } from "@/lib/supabase/server";
import { todaysChallenge, VOICES } from "@/lib/voices";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Add a photo
      </h1>
      <p className="mb-8 text-zinc-500">
        Today&apos;s challenge: {todaysChallenge()}
      </p>
      <CreateForm voices={VOICES} />
    </main>
  );
}
