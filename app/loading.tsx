import { Pigeon } from "@/components/pigeon";

export default function Loading() {
  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center"
      aria-busy="true"
      aria-live="polite"
    >
      <Pigeon size={96} flapping />
      <div className="flex items-center gap-1.5" aria-hidden>
        {["bg-primary", "bg-yellow", "bg-blue"].map((color, i) => (
          <span
            key={color}
            className={`h-3 w-3 animate-bob rounded-full ${color}`}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
      <p className="font-display text-lg font-black">Pulling into the station…</p>
    </main>
  );
}
