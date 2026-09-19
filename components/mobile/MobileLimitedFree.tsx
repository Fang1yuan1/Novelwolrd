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
    <section className="nw-books">
      <div className="nw-books-head">
        <div className="nw-books-titlegroup">
          <h2>مجاني لفترة محدودة</h2>
          <span className="nw-timer" dir="ltr">
            <span className="nw-timer-box">{pad(h)}</span>
            <span className="nw-timer-colon">:</span>
            <span className="nw-timer-box">{pad(m)}</span>
            <span className="nw-timer-colon">:</span>
            <span className="nw-timer-box nw-timer-box-red">{pad(s)}</span>
          </span>
        </div>
        <a href="/free" className="nw-more">
          المزيد ‹
        </a>
      </div>
      <ul className="nw-free-scroll">
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
