"use client";

import { useEffect, useRef, useState } from "react";
import { COPY, POST_KINDS, type PostKind } from "@/lib/community-copy";
import { createPost } from "@/lib/community";
import { useKeyboardInset, useLockScroll } from "@/lib/useKeyboardInset";
import { CmIcon, EmojiPanel, applyEdit } from "./shared";

// صفحة كتابة منشور — مقاسة من لقطة 发帖 (828 عرض)
export default function Composer({
  novelId,
  defaultKind,
  onClose,
  onPosted,
}: {
  novelId: number;
  defaultKind: PostKind;
  onClose: () => void;
  onPosted: () => void;
}) {
  const inset = useKeyboardInset();
  useLockScroll();
  const [kind, setKind] = useState<PostKind>(defaultKind);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [emoji, setEmoji] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const ok = body.trim().length >= 2 && !busy;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function edit(e: { insert?: string; wrap?: string }) {
    const r = applyEdit(ta.current, body, 3000, e);
    setBody(r.value);
    requestAnimationFrame(() => {
      ta.current?.focus();
      ta.current?.setSelectionRange(r.caret, r.caret);
    });
  }

  function addLink() {
    const url = window.prompt(COPY.linkAsk, "https://");
    if (url && /^https?:\/\/\S+$/.test(url.trim())) edit({ insert: ` ${url.trim()} ` });
  }

  async function send() {
    if (!ok) return;
    setBusy(true);
    try {
      await createPost({ novelId, kind, title, body });
      onPosted();
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setToast(m.includes("rate_limited") ? COPY.composeLimit : m.includes("body_too_short") ? COPY.composeTooShort : COPY.offline);
      setBusy(false);
    }
  }

  const soon = () => setToast(COPY.soon);

  return (
    <div className="pc-root" dir="rtl" style={{ bottom: inset }}>
      <div className="pc-bar">
        <button className="pc-x" type="button" onClick={onClose} aria-label="إغلاق">
          <svg viewBox="0 0 26 26" fill="none" aria-hidden><path d="M3 3l20 20M23 3L3 23" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" /></svg>
        </button>
        <button className={`pc-pub${ok ? " is-on" : ""}`} type="button" disabled={!ok} onClick={send}>
          {busy ? COPY.composeSending : COPY.composeSend}
        </button>
      </div>

      <div className="pc-main">
        <div className="pc-title">
          <input
            value={title}
            maxLength={60}
            placeholder={COPY.composeTitlePh}
            onChange={(e) => setTitle(e.target.value)}
          />
          <span className="pc-count"><b>{title.length}</b>/60</span>
        </div>

        <div className="pc-body" onClick={() => { setEmoji(false); ta.current?.focus(); }}>
          {body.length === 0 && (
            <div className="pc-ph" aria-hidden>
              {COPY.composeBullets.map((t) => (
                <div key={t}>· {t}</div>
              ))}
            </div>
          )}
          <textarea
            ref={ta}
            value={body}
            maxLength={3000}
            onFocus={() => setEmoji(false)}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>

      <div className="pc-chips">
        {POST_KINDS.map((k) => (
          <button key={k} type="button" className={`pc-chip${kind === k ? " is-active" : ""}`} onClick={() => setKind(k)}>
            {COPY.kinds[k]}
          </button>
        ))}
      </div>

      <div className="pc-tools">
        <button type="button" className="pc-t" aria-label="إيموجي" onClick={() => { ta.current?.blur(); setEmoji((v) => !v); }}>
          <CmIcon name="tb-smile" w={40} h={40} />
        </button>
        <span className="pc-pill">
          <button type="button" className="pc-t" aria-label="صورة" onClick={soon}><CmIcon name="tb-image" w={40} h={33} /></button>
          <button type="button" className="pc-t" aria-label="فيديو" onClick={soon}><CmIcon name="tb-film" w={40} h={40} /></button>
          <button type="button" className="pc-t" aria-label="رواية" onClick={soon}><CmIcon name="tb-book" w={40} h={35} /></button>
        </span>
        <button type="button" className="pc-t" aria-label="إشارة" onClick={() => edit({ insert: "@" })}><CmIcon name="tb-at" w={40} h={40} /></button>
        <button type="button" className="pc-t" aria-label="وسم" onClick={() => edit({ insert: "#" })}><CmIcon name="tb-hash" w={37} h={37} /></button>
        <button type="button" className="pc-t" aria-label="استطلاع" onClick={soon}><CmIcon name="tb-poll" w={35} h={35} /></button>
        <button type="button" className="pc-t" aria-label="غامق" onClick={() => edit({ wrap: "**" })}><CmIcon name="tb-bold" w={29} h={39} /></button>
        <button type="button" className="pc-t" aria-label="رابط" onClick={addLink}><CmIcon name="tb-link" w={40} h={40} /></button>
      </div>
      {emoji && <EmojiPanel onPick={(e) => edit({ insert: e })} />}
      {toast && <div className="pc-toast">{toast}</div>}
    </div>
  );
}
