"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

export function Tilt({ children, max = 8, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 2 * max).toFixed(2)}deg) rotateY(${((px - 0.5) * 2 * max).toFixed(2)}deg) scale3d(1.02,1.02,1)`;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.dataset.active = "true";
    });
  };

  const leave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    delete el.dataset.active;
    el.style.transition = "transform 500ms cubic-bezier(.03,.98,.52,.99)";
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    setTimeout(() => {
      if (ref.current) ref.current.style.transition = "";
    }, 520);
  };

  return (
    <div className={className} style={{ perspective: 900 }}>
      <div
        ref={ref}
        onMouseMove={move}
        onMouseLeave={leave}
        style={{ transformStyle: "preserve-3d", willChange: "transform" } as CSSProperties}
        className="relative h-full overflow-hidden rounded-2xl [&_.tilt-glare]:opacity-0 [&[data-active='true']_.tilt-glare]:opacity-100"
      >
        {children}
        <span
          aria-hidden
          className="tilt-glare pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgb(125 211 252 / .18), rgb(167 139 250 / .08) 40%, transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}
