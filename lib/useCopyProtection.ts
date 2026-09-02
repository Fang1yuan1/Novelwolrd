"use client";

import { useEffect, useRef } from "react";

/**
 * هوك بسيط بيمنع النسخ اليدوي (تحديد النص / Ctrl+C / كليك يمين / نسخ)
 * جوه عنصر واحد بس (النص/الفصل)، من غير أي تأثير بصري على باقي الصفحة.
 *
 * الاستخدام:
 *   const ref = useCopyProtection<HTMLDivElement>();
 *   <div ref={ref} className="chapter-no-copy">...النص...</div>
 */
export function useCopyProtection<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const blockEvent = (e: Event) => e.preventDefault();

    el.addEventListener("copy", blockEvent);
    el.addEventListener("cut", blockEvent);
    el.addEventListener("contextmenu", blockEvent);
    el.addEventListener("dragstart", blockEvent);

    // يمنع Ctrl+C / Cmd+C وإحنا فوكس داخل العنصر ده بس
    const blockKeys = (e: KeyboardEvent) => {
      const isCopyShortcut =
        (e.ctrlKey || e.metaKey) && ["c", "x", "a"].includes(e.key.toLowerCase());
      if (isCopyShortcut) e.preventDefault();
    };
    el.addEventListener("keydown", blockKeys);

    return () => {
      el.removeEventListener("copy", blockEvent);
      el.removeEventListener("cut", blockEvent);
      el.removeEventListener("contextmenu", blockEvent);
      el.removeEventListener("dragstart", blockEvent);
      el.removeEventListener("keydown", blockKeys);
    };
  }, []);

  return ref;
}
