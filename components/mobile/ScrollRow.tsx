"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** صف أفقي قابل للتمرير يبدأ دائماً من أوله (يمين) — 4 أغلفة كاملة + جزء من الخامس كالمرجع. */
export default function ScrollRow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollLeft = 0;
  }, []);
  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
