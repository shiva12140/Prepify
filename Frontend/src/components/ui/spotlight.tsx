import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { cn } from "../../lib/utils";

type SpotlightProps = {
  parentRef: RefObject<HTMLDivElement|null>;
  className?: string;
};

export const Spotlight = ({ parentRef, className }: SpotlightProps) => {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const handleMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      setPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleLeave = () => {
      setPos({ x: -9999, y: -9999 });
    };

    parent.addEventListener("mousemove", handleMove);
    parent.addEventListener("mouseleave", handleLeave);

    return () => {
      parent.removeEventListener("mousemove", handleMove);
      parent.removeEventListener("mouseleave", handleLeave);
    };
  }, [parentRef]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 transition-transform duration-75 ease-out",
        className
      )}
      style={{
        transform: `translate(${pos.x - 600}px, ${pos.y - 600}px)`,
      }}
    >
      <svg
        className="w-[1200px] h-[1200px] opacity-40 blur-3xl"
        viewBox="0 0 1200 1200"
        fill="none"
      >
        <defs>
          <radialGradient id="spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="600" cy="600" r="600" fill="url(#spot)" />
      </svg>
    </div>
  );
};
