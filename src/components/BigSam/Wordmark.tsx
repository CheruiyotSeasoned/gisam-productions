"use client";

/**
 * The Big-Sam text logo.
 *
 * On phones the logo image shrinks to almost nothing, so the wordmark carries the
 * brand instead: "BIG" in ink, a live audio equalizer standing in for the hyphen,
 * and "SAM" in red — with an event tag underneath. It scales up on larger screens
 * rather than being swapped out, so the mark reads the same everywhere.
 */

type Tone = "light" | "dark";

export default function Wordmark({
  tone = "light",
  tag = "Auditions '26",
  className = "",
}: {
  /** "light" = on a white surface (ink text). "dark" = on a black surface (white text). */
  tone?: Tone;
  /** Small caps line under the wordmark. Pass "" to hide it. */
  tag?: string;
  className?: string;
}) {
  const ink = tone === "dark" ? "text-white" : "text-secondary";
  const tagTone = tone === "dark" ? "text-white/50" : "text-MistyTealText";

  return (
    <span className={`inline-flex flex-col leading-none select-none ${className}`}>
      <span className="flex items-center gap-[3px] font-black tracking-tight text-lg sm:text-xl">
        <span className={ink}>BIG</span>
        <Equalizer />
        <span className="text-primary">SAM</span>
      </span>
      {tag && (
        <span className={`mt-[3px] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.28em] ${tagTone}`}>
          {tag}
        </span>
      )}
    </span>
  );
}

/** Three red bars pulsing like a live level meter — the "-" in BIG-SAM. */
function Equalizer() {
  // Staggered delays so the bars never move in lockstep.
  const bars = ["0ms", "180ms", "360ms"];
  return (
    <span className="flex h-[0.85em] items-center gap-[2px]" aria-hidden="true">
      {bars.map((delay, i) => (
        <span
          key={i}
          className="block w-[2px] h-full origin-center rounded-full bg-primary animate-eq motion-reduce:animate-none motion-reduce:scale-y-75"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  );
}
