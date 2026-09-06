"use client";

import { useEffect, useState } from "react";
import type { Novel } from "@/lib/novels";

// عداد تنازلي شكلي فقط لعرض التصميم — لا يرتبط بميزة "مجانية مؤقتة" حقيقية
// بقاعدة البيانات حالياً. يُعاد ضبطه كل ساعة تلقائياً حتى لا يظهر متجمداً.
function useDisplayCountdown() {
  const [time, setTime] = useState({ h: 11, m: 35, s: 14 });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 11;
          m = 35;
          s = 14;
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function MobileLimitedFree({ novels }: { novels: Novel[] }) {
  const { h, m, s } = useDisplayCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const items = novels.slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <span className="mobile-reference-heading-group">
          <h2>مجاني لفترة محدودة</h2>
          <span className="flex items-center gap-1 text-[13px] font-bold tabular-nums">
            <span className="rounded bg-[#2b2b2e] px-1.5 py-0.5 text-white">{pad(h)}</span>
            :
            <span className="rounded bg-[#2b2b2e] px-1.5 py-0.5 text-white">{pad(m)}</span>
            :
            <span className="rounded bg-[#e5353e] px-1.5 py-0.5 text-white">{pad(s)}</span>
          </span>
        </span>
        <a href="/categories">المزيد ‹</a>
      </div>
      <ul className="scroll-thin flex gap-2.5 overflow-x-auto pb-1">
        {items.map((n) => (
          <li key={n.id} className="w-[86px] shrink-0">
            <a href={`/novel/${n.id}`} className="block">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={n.cover_url}
                  alt={n.title}
                  className="aspect-[0.72] w-full rounded-lg object-cover"
                />
              ) : (
                <span className="ph-block aspect-[0.72] block w-full rounded-lg text-[10px]">
                  الغلاف
                </span>
              )}
              <span className="line-clamp-2 mt-1.5 block text-[11px] font-semibold leading-snug text-ink-900">
                {n.title}
              </span>
              <span className="line-clamp-1 mt-0.5 block text-[10px] text-ink-400">
                {n.author || "—"}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
