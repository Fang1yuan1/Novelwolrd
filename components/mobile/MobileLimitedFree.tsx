"use client";

import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLUListElement>(null);

  // يضمن أن الصف يبدأ من أوله (يمين) — 4 أغلفة كاملة وجزء صغير من الخامس كالمرجع —
  // حتى لو فتح Safari الصف بإزاحة أفقية غير متوقعة.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = 0;
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="nw-books">
      <div className="nw-books-head">
        <div className="nw-books-titlegroup">
          <h2 className="nw-free-title">
            <span>مجاني</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/ui/bolt.png" alt="" aria-hidden="true" className="nw-bolt" />
            <span>لفترة محدودة</span>
          </h2>
          <span className="nw-timer" dir="ltr">
            <span className="nw-timer-box">{pad(h)}</span>
            <span className="nw-timer-colon" aria-hidden="true" />
            <span className="nw-timer-box">{pad(m)}</span>
            <span className="nw-timer-colon" aria-hidden="true" />
            <span className="nw-timer-box nw-timer-box-red">{pad(s)}</span>
          </span>
        </div>
        <a href="/free" className="nw-more">
          المزيد ‹
        </a>
      </div>
      <ul className="nw-free-scroll" ref={scrollRef}>
        {items.map((n) => (
          <li key={n.id} className="nw-free-item">
            <a href={`/novel/${n.id}`} className="nw-book">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="nw-book-cover" src={n.cover_url} alt={n.title} />
              ) : (
                <span className="nw-book-cover" />
              )}
              <strong className="nw-book-title">{n.title}</strong>
              <span className="nw-book-author">{n.author || "—"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
