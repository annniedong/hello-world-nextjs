import Link from "next/link";
import { SubwayBullet } from "@/components/subway-bullet";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 whitespace-nowrap"
      aria-label="NYC Captions home"
    >
      <SubwayBullet line="C" size={34} />
      <span className="font-display text-xl font-black tracking-tight">
        NYC Captions
      </span>
    </Link>
  );
}
