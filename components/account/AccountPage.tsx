"use client";

import { useEffect, useState } from "react";
import { displayNameOf, useAuth } from "@/lib/auth";
import { CmIcon } from "@/components/community/shared";
import { DEFAULT_AVATAR, metaOf } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { COPY } from "@/lib/community-copy";

const T = {
  card: "حسابي",
  tag: "حدث",
  stats: ["فصول قرأتها", "أيام القراءة", "ساعات القراءة", "روايات قرأتها"],
  levelWord: "مستوى",
  loginTitle: "سجّل الدخول",
  loginSub: "لتتبّع قراءتك وتشارك في ممالك القرّاء",
  loginBtn: "تسجيل الدخول / إنشاء حساب",
  settings: "الإعدادات",
  signOut: "تسجيل الخروج",
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
  const pic = metaOf(user).avatar_url || DEFAULT_AVATAR;
  const lvl = levelOf(stats.chapters);
  const nums = [stats.chapters, stats.days, stats.hours, stats.books];

  return (
    <div className="ac-root" dir="rtl">
      <div className="ac-top">
        {user && (
          <button
            className="ac-gear"
            type="button"
            aria-label={T.settings}
            onClick={() => setSheet(true)}
          >
            <svg viewBox="0 0 40 34" fill="none" aria-hidden>
              <path d="M3 9h18M31 9h6M3 25h6M19 25h18" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
              <circle cx="26" cy="9" r="5" stroke="currentColor" strokeWidth="3.4" />
              <circle cx="14" cy="25" r="5" stroke="currentColor" strokeWidth="3.4" />
            </svg>
          </button>
        )}

        {user ? (
          <a className="ac-who" href="/account/edit">
            <span className="ac-avatar" style={{ backgroundImage: `url(${pic})` }} />
            <span className="ac-id">
              <span className="ac-name">{shown}</span>
              <span className="ac-level">{T.levelWord} {lvl + 1} · {COPY.ranks[lvl]}</span>
            </span>
            <CmIcon name="chev" w={12} h={20} className="ac-chev" />
          </a>
        ) : (
          <div className="ac-who" role="button" onClick={() => ready && openLogin()}>
            <span className="ac-avatar" style={{ backgroundImage: `url(${DEFAULT_AVATAR})` }} />
            <span className="ac-id">
              <span className="ac-name">{ready ? T.loginTitle : ""}</span>
              {ready && <span className="ac-sub">{T.loginSub}</span>}
            </span>
          </div>
        )}
      </div>

      {user ? (
        <section className="ac-card">
          <h2>{T.card}</h2>
          <span className="ac-tag">{T.tag}</span>
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

      {sheet && user && (
        <div className="au-overlay" onClick={() => setSheet(false)} dir="rtl">
          <div className="au-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="au-head"><h2>{T.settings}</h2></div>
            <div className="au-form">
              <button
                className="au-btn"
                type="button"
                style={{ background: "#f5f5f5", color: "#191919", marginTop: 0 }}
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
