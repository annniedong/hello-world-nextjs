import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Joke = {
  id: number;
  joke: string;
  author: string;
  created_at: string;
};

export default async function JokesPage() {
  const { data, error } = await supabase
    .from("jokes")
    .select("id, joke, author, created_at")
    .order("id", { ascending: true });

  const jokes = (data ?? []) as Joke[];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Jokes</h1>
      {error ? (
        <p className="text-red-600">Failed to load jokes: {error.message}</p>
      ) : jokes.length === 0 ? (
        <p>No jokes yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {jokes.map((j) => (
            <li
              key={j.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="text-lg">{j.joke}</p>
              <p className="mt-2 text-sm text-zinc-500">
                {j.author} &middot; {new Date(j.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
