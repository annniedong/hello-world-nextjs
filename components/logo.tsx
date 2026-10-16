import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap" aria-label="NYC Captions home">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M5 4h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-6.5L8 21.5V18H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        NYC Captions
      </span>
    </Link>
  );
}
