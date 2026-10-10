"use client";

import type { CSSProperties } from "react";
import { rankIndex, rankName } from "@/lib/community";

// أيقونة من صورة شفافة (قناع) بلون currentColor — الأبعاد بوحدة المرجع cu
export function CmIcon({
  name,
  w,
  h,
  className = "",
  style,
}: {
  name: "search" | "hash" | "chevron" | "like" | "tri" | "pencil" | "level" | "flame";
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

export function Avatar({ name, hue, size }: { name: string; hue: number; size?: number }) {
  const initial = Array.from(name.trim())[0] ?? "؟";
  return (
    <span
      className="cm-avatar"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 46% 58%), hsl(${(hue + 28) % 360} 48% 44%))`,
        ...(size ? { width: `calc(${size} * var(--cu))`, height: `calc(${size} * var(--cu))` } : null),
      }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export function RankBadge({ points }: { points: number }) {
  return <span className={`cm-badge rank r${rankIndex(points)}`}>{rankName(points)}</span>;
}
