"use client";

import { useEffect, useRef, useState } from "react";
import { COPY } from "@/lib/community-copy";
import { useKeyboardInset, useLockScroll } from "@/lib/useKeyboardInset";
import { CmIcon, EmojiPanel, applyEdit } from "./shared";

// نافذة كتابة تعليق / الرد على تعليق — مقاسة من لقطة 发表评论
export default function CommentSheet({
  replyTo,
  onClose,
  onSend,
}: {
  replyTo?: string;
  onClose: () => void;
  onSend: (text: string) => Promise<void>;
}) {
  const inset = useKeyboardInset();
  useLockScroll();
  const [text, setText] = useState(replyTo ? `@${replyTo} ` : "");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [emoji, setEmoji] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const ok = text.trim().length >= 1 && !busy;

  useEffect(() => {
    ta.current?.focus();
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function edit(e: { insert?: string }) {
    const r = applyEdit(ta.current, text, 1500, e);
    setText(r.value);
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
      await onSend(text.trim());
      onClose();
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setToast(m.includes("rate_limited") ? COPY.composeLimit : COPY.offline);
      setBusy(false);
    }
  }

  return (
    <div className="cs-overlay" dir="rtl" onClick={onClose}>
      <div className="cs-sheet" style={{ bottom: inset }} onClick={(e) => e.stopPropagation()}>
        <div className="cs-head">
          <button className="cs-x" type="button" onClick={onClose} aria-label="إغلاق">
            <svg viewBox="0 0 26 26" fill="none" aria-hidden><path d="M3 3l20 20M23 3L3 23" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" /></svg>
          </button>
          <h2>{replyTo ? COPY.replyTitle(replyTo) : COPY.commentTitle}</h2>
          <button className={`cs-pub${ok ? " is-on" : ""}`} type="button" disabled={!ok} onClick={send}>
            {COPY.composeSend}
          </button>
        </div>

        <div className="cs-body" onClick={() => { setEmoji(false); ta.current?.focus(); }}>
          {text.length === 0 && <div className="cs-ph" aria-hidden>{replyTo ? COPY.replyPh(replyTo) : COPY.commentPh}</div>}
          <textarea
            ref={ta}
            value={text}
            maxLength={1500}
            onFocus={() => setEmoji(false)}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="cs-tools">
          <button type="button" className="pc-t" aria-label="إيموجي" onClick={() => { ta.current?.blur(); setEmoji((v) => !v); }}>
            <CmIcon name="tb-smile" w={40} h={40} />
          </button>
          <button type="button" className="pc-t" aria-label="صورة" onClick={() => setToast(COPY.soon)}>
            <CmIcon name="tb-image" w={40} h={33} />
          </button>
          <button type="button" className="pc-t" aria-label="إشارة" onClick={() => edit({ insert: "@" })}>
            <CmIcon name="tb-at" w={40} h={40} />
          </button>
          <button type="button" className="pc-t" aria-label="رابط" onClick={addLink}>
            <CmIcon name="tb-link" w={40} h={40} />
          </button>
          <span className="cs-count">{text.length}/1500</span>
        </div>
        {emoji && <EmojiPanel onPick={(e) => edit({ insert: e })} />}
        {toast && <div className="pc-toast">{toast}</div>}
      </div>
    </div>
  );
}
