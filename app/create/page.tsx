import { redirect } from "next/navigation";
import { CreateForm } from "@/components/create-form";
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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Add a photo
      </h1>
      <p className="mb-8 mt-2 rounded-2xl bg-accent/25 p-4 text-sm">
        <span className="font-semibold">Today&apos;s challenge:</span>{" "}
        {todaysChallenge()}
      </p>
      <CreateForm voices={VOICES} />
    </main>
  );
}
