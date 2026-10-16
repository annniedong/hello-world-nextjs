"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/vote", label: "Rate", auth: false },
  { href: "/top", label: "Top", auth: false },
  { href: "/dashboard", label: "My photos", auth: true },
];

export function NavLinks({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {LINKS.filter((link) => signedIn || !link.auth).map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-surface-2 text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
