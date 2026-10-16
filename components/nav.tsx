import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { PlusIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { SignOutButton } from "@/components/sign-out-button";
import { buttonClass } from "@/lib/ui";
import { getViewer, getViewerProfile } from "@/lib/viewer";

export async function Nav() {
  const { user } = await getViewer();
  const profile = await getViewerProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLinks signedIn={Boolean(user)} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:block">
                <Link href="/create" className={buttonClass("primary")}>
                  <PlusIcon className="h-4 w-4" />
                  Add photo
                </Link>
              </div>
              <Link href="/profile" aria-label="Your profile" className="rounded-full">
                <Avatar
                  url={profile?.avatar_url}
                  name={profile?.first_name ?? user.email}
                />
              </Link>
              <div className="hidden pl-1 md:block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClass("secondary")}>
                Sign in
              </Link>
              <div className="hidden md:block">
                <Link href="/create" className={buttonClass("primary")}>
                  Start captioning
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
