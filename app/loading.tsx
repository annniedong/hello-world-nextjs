export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-lg bg-surface-2" />
        {[0, 1].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="h-64 bg-surface-2" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 rounded bg-surface-2" />
              <div className="h-4 w-2/3 rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
