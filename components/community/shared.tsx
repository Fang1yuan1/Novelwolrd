"use client";

import type { CSSProperties } from "react";
import { rankIndex, rankName } from "@/lib/community";
import { DEFAULT_AVATAR } from "@/lib/profile";

// أيقونة من صورة شفافة (قناع) بلون currentColor — الأبعاد بوحدة المرجع cu
export function CmIcon({
  name,
  w,
  h,
  className = "",
  style,
}: {
  name: "search" | "chev" | "hash" | "chevron" | "like" | "tri" | "pencil" | "level" | "flame" | "tb-smile" | "tb-image" | "tb-film" | "tb-book" | "tb-at" | "tb-hash" | "tb-poll" | "tb-bold" | "tb-link";
  w: number;
  h: number;
  className?: string;
  style?: CSSProperties;
}) {
  const url = name === "flame" ? "/icons/flame.png" : `/icons/community/${name}.png`;
  return (
    <span
      aria-hidden
      className={`cm-ico ${className}`}
      style={{
        ["--m" as string]: `url(${url})`,
        width: `calc(${w} * var(--cu))`,
        height: `calc(${h} * var(--cu))`,
        ...style,
      }}
    />
  );
}

export function CommentIcon() {
  return (
    <svg viewBox="0 0 34 30" fill="none" aria-hidden>
      <path
        d="M5 3h24a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H13l-6.5 5.5V22H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="10.5" cy="12.5" r="1.9" fill="currentColor" />
      <circle cx="17" cy="12.5" r="1.9" fill="currentColor" />
      <circle cx="23.5" cy="12.5" r="1.9" fill="currentColor" />
    </svg>
  );
}

// سهم الرجوع (يتجه لليمين بصفحة RTL)
export function BackIcon() {
  return (
    <svg viewBox="0 0 18 32" fill="none" aria-hidden>
      <path d="M3 3l13 13L3 29" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Avatar({ src, size }: { name?: string; hue?: number; src?: string | null; size?: number }) {
  return (
    <span
      className="cm-avatar"
      style={{
        backgroundImage: `url(${src || DEFAULT_AVATAR})`,
        ...(size ? { width: `calc(${size} * var(--cu))`, height: `calc(${size} * var(--cu))` } : null),
      }}
      aria-hidden
    />
  );
}

export function RankBadge({ points }: { points: number }) {
  return <span className={`cm-badge rank r${rankIndex(points)}`}>{rankName(points)}</span>;
}

// لوحة الإيموجي البسيطة (بدل لوحة المفاتيح عند الضغط على الوجه المبتسم)
const EMOJIS = ["😀","😂","🥹","😍","🥰","😎","🤔","😭","😡","😱","🥲","😴","🤯","🙏","👍","👎","👏","🔥","💔","❤️","✨","🎉","💯","😏","😅","🤣","😬","🙄","😤","🥳","😇","🤝","👀","💪","🌹","⭐","📖","⚔️","🐉","🌙"];

export function EmojiPanel({ onPick }: { onPick: (e: string) => void }) {
  return (
    <div className="cm-emoji" dir="ltr">
      {EMOJIS.map((e) => (
        <button key={e} type="button" onClick={() => onPick(e)}>{e}</button>
      ))}
    </div>
  );
}

// إدراج نص عند مؤشر الكتابة (أو تغليف المحدد) داخل textarea متحكَّم به
export function applyEdit(
  el: HTMLTextAreaElement | null,
  value: string,
  max: number,
  edit: { insert?: string; wrap?: string }
): { value: string; caret: number } {
  const start = el?.selectionStart ?? value.length;
  const end = el?.selectionEnd ?? value.length;
  let next = value;
  let caret = start;
  if (edit.wrap) {
    const sel = value.slice(start, end) || "نص";
    next = value.slice(0, start) + edit.wrap + sel + edit.wrap + value.slice(end);
    caret = start + edit.wrap.length + sel.length + edit.wrap.length;
  } else if (edit.insert) {
    next = value.slice(0, start) + edit.insert + value.slice(end);
    caret = start + edit.insert.length;
  }
  if (next.length > max) return { value, caret: start };
  return { value: next, caret };
}
