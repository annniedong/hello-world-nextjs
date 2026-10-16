const COLORS = ["#00933C", "#FCCC0A", "#0039A6", "#EE352E", "#FF6319", "#6CBE45"];

// Fixed values (not random) so server and client render identically.
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 29) % 100,
  delay: ((i * 7) % 10) * 0.07,
  drift: ((i % 7) - 3) * 28,
  spin: 360 + ((i * 53) % 540),
  color: COLORS[i % COLORS.length],
  width: 6 + (i % 4) * 2,
  height: 10 + (i % 3) * 3,
}));

export function Confetti() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="absolute top-0 animate-confetti rounded-[2px]"
          style={
            {
              left: `${piece.left}%`,
              width: piece.width,
              height: piece.height,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              "--drift": `${piece.drift}px`,
              "--spin": `${piece.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
