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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-end justify-around px-2 pb-1 pt-2">
        {tabs.map(({ href, label, icon: Icon, primary }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 py-1 text-[11px] font-medium"
              >
                {primary ? (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                ) : (
                  <Icon
                    className={`h-5 w-5 ${active ? "text-foreground" : "text-muted"}`}
                  />
                )}
                <span className={active || primary ? "text-foreground" : "text-muted"}>
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
