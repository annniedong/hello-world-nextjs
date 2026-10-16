// A simple Manhattan skyline silhouette (Chrysler, Empire State, One WTC and friends).
const BLOCKS: [number, number, number][] = [
  [0, 60, 70], [58, 46, 105], [102, 64, 82], [164, 44, 128], [206, 58, 92],
  [380, 56, 96], [492, 50, 120], [540, 64, 84], [602, 48, 110], [648, 62, 74],
  [780, 54, 118], [832, 66, 88], [896, 46, 134], [940, 70, 96], [1008, 52, 112],
  [1058, 62, 80], [1118, 44, 100], [1160, 40, 72],
];

export function Skyline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 190"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      {BLOCKS.map(([x, w, h]) => (
        <rect key={x} x={x} y={190 - h} width={w} height={h} rx="2" />
      ))}

      {/* Chrysler Building */}
      <rect x="268" y="84" width="54" height="106" />
      <rect x="276" y="60" width="38" height="26" />
      <rect x="282" y="40" width="26" height="22" />
      <rect x="288" y="24" width="14" height="18" />
      <rect x="293.5" y="2" width="3" height="24" />

      {/* Empire State Building */}
      <rect x="398" y="104" width="92" height="86" />
      <rect x="414" y="76" width="60" height="30" />
      <rect x="428" y="52" width="32" height="26" />
      <rect x="436" y="34" width="16" height="20" />
      <rect x="442.5" y="8" width="3" height="28" />

      {/* One World Trade Center */}
      <polygon points="690,190 702,52 718,52 730,190" />
      <rect x="708.5" y="0" width="3" height="54" />
    </svg>
  );
}
