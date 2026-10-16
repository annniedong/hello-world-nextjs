import { redirect } from "next/navigation";
import { CreateForm } from "@/components/create-form";
import { getPrefs } from "@/lib/prefs";
import { getViewer } from "@/lib/viewer";
import { todaysChallenge, VOICES } from "@/lib/voices";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata = { title: "Add a photo" };

export default async function CreatePage() {
  const { user } = await getViewer();

  if (!user) {
    redirect("/login?next=%2Fcreate");
  }

  const { voiceId } = await getPrefs();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-4xl font-black tracking-tight">
        Add a photo
      </h1>
      <p className="mb-10 mt-4 rounded-2xl border-2 border-yellow bg-yellow/15 p-4 text-sm font-bold">
        <span className="font-black uppercase tracking-wide">
          Today&apos;s challenge:
        </span>{" "}
        {todaysChallenge()}
      </p>
      <CreateForm voices={VOICES} defaultVoiceId={voiceId} />
    </main>
  );
}
