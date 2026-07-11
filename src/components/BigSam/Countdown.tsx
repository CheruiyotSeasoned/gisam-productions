"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  let d = Math.max(0, target - now);
  const days = Math.floor(d / 86400000); d -= days * 86400000;
  const hours = Math.floor(d / 3600000); d -= hours * 3600000;
  const minutes = Math.floor(d / 60000); d -= minutes * 60000;
  const seconds = Math.floor(d / 1000);
  return { days, hours, minutes, seconds };
}

/** Live countdown to the event date. Light variant suits a white hero. */
export default function Countdown({ date, theme = "light" }: { date: string; theme?: "light" | "dark" }) {
  const target = new Date(date.replace(" ", "T")).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (isNaN(target)) return null;

  const cells = [
    { label: "Days", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Mins", value: t.minutes },
    { label: "Secs", value: t.seconds },
  ];

  const box =
    theme === "dark"
      ? "bg-white/15 text-white"
      : "bg-white shadow-round-box text-secondary dark:bg-darklight dark:text-white";
  const label = theme === "dark" ? "text-white/80" : "text-SlateBlueText";

  return (
    <div className="flex gap-3 sm:gap-4">
      {cells.map((c) => (
        <div key={c.label} className="flex flex-col items-center">
          <div className={`min-w-[62px] rounded-14 px-3 py-3 text-center ${box}`}>
            <span className="block text-2xl sm:text-3xl font-extrabold tabular-nums leading-none">
              {String(c.value).padStart(2, "0")}
            </span>
          </div>
          <span className={`mt-2 text-xs font-medium ${label}`}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
