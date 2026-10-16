"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusIcon,
  SparkIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/icons";

export function MobileTabs({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();

  // The onboarding flow takes the whole screen.
  if (pathname === "/login") return null;

  const tabs = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/vote", label: "Rate", icon: SparkIcon },
    { href: "/create", label: "Add", icon: PlusIcon, primary: true },
    { href: "/top", label: "Top", icon: TrophyIcon },
    signedIn
      ? { href: "/profile", label: "You", icon: UserIcon }
      : { href: "/login", label: "Sign in", icon: UserIcon },
  ];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-end justify-around px-2 pb-1.5 pt-2">
        {tabs.map(({ href, label, icon: Icon, primary }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 py-1 text-[11px] font-extrabold uppercase tracking-wide"
              >
                {primary ? (
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_0_var(--primary-dark)] transition-transform active:translate-y-1 active:shadow-none">
                    <Icon className="h-6 w-6" />
                  </span>
                ) : (
                  <span
                    className={`grid h-9 w-12 place-items-center rounded-xl transition-colors ${
                      active ? "bg-blue/10 text-blue" : "text-muted"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                )}
                <span
                  className={
                    primary ? "text-primary" : active ? "text-blue" : "text-muted"
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
