"use client";

import { useState } from "react";
import { COPY, POST_KINDS, type PostKind } from "@/lib/community-copy";
import { createPost } from "@/lib/community";

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
  const [kind, setKind] = useState<PostKind>(defaultKind);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ok = body.trim().length >= 2;

  async function send() {
    if (!ok || busy) return;
    setBusy(true);
    setErr("");
    try {
      await createPost({ novelId, kind, title, body });
      onPosted();
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setErr(m.includes("rate_limited") ? COPY.composeLimit : m.includes("body_too_short") ? COPY.composeTooShort : COPY.offline);
      setBusy(false);
    }
  }

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="cm-modal-head">
          <h2>{COPY.composeTitle}</h2>
          <button className="cm-x" type="button" onClick={onClose} aria-label="إغلاق">×</button>
        </div>
        <div className="cm-chips">
          {POST_KINDS.map((k) => (
            <button key={k} type="button" className={`cm-chip${kind === k ? " is-active" : ""}`} onClick={() => setKind(k)}>
              {COPY.kinds[k]}
            </button>
          ))}
        </div>
        <input
          className="cm-input"
          value={title}
          maxLength={80}
          placeholder={COPY.composeTitlePh}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="cm-textarea"
          value={body}
          maxLength={3000}
          placeholder={COPY.composeBodyPh}
          onChange={(e) => setBody(e.target.value)}
        />
        {err && <div className="cm-error">{err}</div>}
        <div className="cm-modal-foot">
          <span>{body.length} / 3000</span>
          <button className="cm-submit" type="button" disabled={!ok || busy} onClick={send}>
            {busy ? COPY.composeSending : COPY.composeSend}
          </button>
        </div>
      </div>
    </div>
  );
}
