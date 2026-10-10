"use client";

import { useEffect, useState } from "react";
import { avatarOf, displayNameOf, useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { COPY } from "@/lib/community-copy";
import { hueFromKey, renameAuthor } from "@/lib/community";

const T = {
  card: "قراءتي",
  stats: ["فصول قرأتها", "أيام القراءة", "ساعات القراءة", "روايات قرأتها"],
  levelWord: "مستوى",
  loginTitle: "سجّل الدخول",
  loginSub: "لتتبّع قراءتك وتشارك في ممالك القرّاء",
  loginBtn: "تسجيل الدخول / إنشاء حساب",
  memberTitle: "عضوية القرّاء",
  memberSub: "مزايا حصرية لأعضاء عالم الروايات",
  soon: "قريبًا",
  settings: "الإعدادات",
  nameLabel: "اسم العرض",
  save: "حفظ",
  saved: "تم الحفظ ✓",
  signOut: "تسجيل الخروج",
  fail: "تعذّر الحفظ، حاول مرة أخرى.",
};

const CH_STEPS = [0, 30, 150, 500, 1500, 4000];
function levelOf(chapters: number) {
  let r = 0;
  CH_STEPS.forEach((s, i) => {
    if (chapters >= s) r = i;
  });
  return r;
}

type Stats = { chapters: number; days: number; hours: number; books: number };

export default function AccountPage() {
  const { user, ready, openLogin, signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({ chapters: 0, days: 0, hours: 0, books: 0 });
  const [sheet, setSheet] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!supabase || !user) return;
    supabase.rpc("my_reading_stats").then(({ data }) => {
      if (data) {
        const d = data as Partial<Stats>;
        setStats({
          chapters: Number(d.chapters ?? 0),
          days: Number(d.days ?? 0),
          hours: Number(d.hours ?? 0),
          books: Number(d.books ?? 0),
        });
      }
    });
  }, [user]);

  const shown = user ? displayNameOf(user) : "";
  const pic = avatarOf(user);
  const lvl = levelOf(stats.chapters);
  const nums = [stats.chapters, stats.days, stats.hours, stats.books];

  async function saveName() {
    setNote("");
    try {
      await renameAuthor(name);
      setNote(T.saved);
    } catch {
      setNote(T.fail);
    }
  }

  return (
    <div className="ac-root" dir="rtl">
      <div className="ac-top">
        {user && (
          <button
            className="ac-gear"
            type="button"
            aria-label={T.settings}
            onClick={() => {
              setName(shown);
              setNote("");
              setSheet(true);
            }}
          >
            <svg viewBox="0 0 40 34" fill="none" aria-hidden>
              <path d="M3 9h18M31 9h6M3 25h6M19 25h18" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
              <circle cx="26" cy="9" r="5" stroke="currentColor" strokeWidth="3.4" />
              <circle cx="14" cy="25" r="5" stroke="currentColor" strokeWidth="3.4" />
            </svg>
          </button>
        )}

        <div
          className="ac-who"
          role={user ? undefined : "button"}
          onClick={() => !user && ready && openLogin()}
        >
          <span
            className="ac-avatar"
            style={
              pic
                ? { backgroundImage: `url(${pic})` }
                : { background: user ? `linear-gradient(135deg, hsl(${hueFromKey(user.id)} 46% 58%), hsl(${(hueFromKey(user.id) + 28) % 360} 48% 44%))` : "#d9dbe3" }
            }
          >
            {!pic && user ? Array.from(shown)[0] : null}
          </span>
          <span className="ac-id">
            <span className="ac-name">{user ? shown : ready ? T.loginTitle : ""}</span>
            {user ? (
              <span className="ac-level">{T.levelWord} {lvl + 1} · {COPY.ranks[lvl]}</span>
            ) : (
              ready && <span className="ac-sub">{T.loginSub}</span>
            )}
          </span>
        </div>
      </div>

      {user ? (
        <section className="ac-card">
          <h2>{T.card}</h2>
          <div className="ac-stats">
            {nums.map((n, i) => (
              <div key={i} className="ac-stat">
                <b>{n}</b>
                <span>{T.stats[i]}</span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        ready && (
          <section className="ac-card ac-card-login">
            <button type="button" className="ac-login-btn" onClick={() => openLogin()}>
              {T.loginBtn}
            </button>
          </section>
        )
      )}

      <section className="ac-member">
        <div className="ac-member-text">
          <b>{T.memberTitle}</b>
          <span>{T.memberSub}</span>
        </div>
        <span className="ac-member-soon">{T.soon}</span>
      </section>

      {sheet && user && (
        <div className="au-overlay" onClick={() => setSheet(false)} dir="rtl">
          <div className="au-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="au-head"><h2>{T.settings}</h2></div>
            <div className="au-form">
              <p className="au-hint">{T.nameLabel}</p>
              <input className="au-input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
              {note && <div className="au-msg" style={{ margin: "12px 0 0", color: note === T.saved ? "#3a9d5d" : "#e5353e" }}>{note}</div>}
              <button className="au-btn" type="button" disabled={name.trim().length < 2} onClick={saveName}>{T.save}</button>
              <button
                className="au-btn"
                type="button"
                style={{ background: "#f5f5f5", color: "#191919" }}
                onClick={async () => {
                  await signOut();
                  setSheet(false);
                }}
              >
                {T.signOut}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
