import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-zinc-200 px-6 py-4 text-sm dark:border-zinc-800">
      <Link href="/" className="font-semibold">
        NYC Captions
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/top" className="hover:underline">
          Top
        </Link>
        {user ? (
          <>
            <Link href="/create" className="hover:underline">
              Add photo
            </Link>
            <Link href="/dashboard" className="hover:underline">
              My photos
            </Link>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
