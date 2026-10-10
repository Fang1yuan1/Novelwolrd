"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { displayNameOf, useAuth } from "@/lib/auth";
import { BackIcon, CmIcon } from "@/components/community/shared";
import { DEFAULT_AVATAR, metaOf, saveProfile, uploadAvatar } from "@/lib/profile";

// كلمات الصفحة (مقابل 编辑社区资料 بمرجع Qidian)
const T = {
  title: "تعديل ملف المجتمع",
  avatar: "الصورة الشخصية",
  name: "الاسم",
  bio: "نبذة عن المجتمع",
  bioEmpty: "أضف نبذة",
  birthday: "تاريخ الميلاد",
  birthdayEmpty: "غير محدد",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  pick: "اختر صورة من جهازك",
  reset: "استعادة الصورة الافتراضية",
  namePh: "اسمك (2–24 حرفًا)",
  bioPh: "اكتب نبذة قصيرة عن نفسك (حتى 120 حرفًا)",
  fail: "تعذّر الحفظ، حاول مرة أخرى.",
  loginFirst: "سجّل الدخول أولًا لتعديل ملفك.",
  login: "تسجيل الدخول / إنشاء حساب",
  birthHint: "تاريخ ميلادك يبقى خاصًا بك ولا يظهر لأحد.",
};

type Key = "avatar" | "name" | "bio" | "birthday";

function fmtDate(iso: string) {
  const m = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const [y, mo, d] = iso.split("-").map(Number);
  if (!y || !mo || !d) return iso;
  return `${d} ${m[mo - 1]} ${y}`;
}

export default function EditProfile() {
  const router = useRouter();
  const { user, ready, openLogin } = useAuth();
  const [editing, setEditing] = useState<Key | null>(null);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/account");
  }

  if (ready && !user) {
    return (
      <div className="ed-root" dir="rtl">
        <div className="ed-nav">
          <button className="ed-back" type="button" onClick={goBack} aria-label="رجوع"><BackIcon /></button>
          <h1>{T.title}</h1>
        </div>
        <div className="ed-login">
          <p>{T.loginFirst}</p>
          <button type="button" className="ac-login-btn" onClick={() => openLogin()}>{T.login}</button>
        </div>
      </div>
    );
  }
  if (!user) return <div className="ed-root" dir="rtl" />;

  const m = metaOf(user);
  const shown = displayNameOf(user);
  const pic = m.avatar_url || DEFAULT_AVATAR;

  function open(k: Key) {
    setErr("");
    setVal(k === "name" ? shown : k === "bio" ? m.bio ?? "" : k === "birthday" ? m.birthday ?? "" : "");
    setEditing(k);
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setErr("");
    try {
      await fn();
      setEditing(null);
    } catch {
      setErr(T.fail);
    }
    setBusy(false);
  }

  const save = () =>
    run(async () => {
      if (!user || !editing) return;
      if (editing === "name") await saveProfile(user, { name: val });
      if (editing === "bio") await saveProfile(user, { bio: val });
      if (editing === "birthday") await saveProfile(user, { birthday: val });
    });

  const onFile = (f: File | undefined) =>
    f &&
    run(async () => {
      if (!user) return;
      const url = await uploadAvatar(user, f);
      await saveProfile(user, { avatarUrl: url });
    });

  const rows: { key: Key; label: string; value: React.ReactNode }[] = [
    { key: "avatar", label: T.avatar, value: <span className="ed-pic" style={{ backgroundImage: `url(${pic})` }} /> },
    { key: "name", label: T.name, value: <span className="ed-val">{shown}</span> },
    { key: "bio", label: T.bio, value: <span className="ed-val">{m.bio || T.bioEmpty}</span> },
    { key: "birthday", label: T.birthday, value: <span className="ed-val">{m.birthday ? fmtDate(m.birthday) : T.birthdayEmpty}</span> },
  ];

  return (
    <div className="ed-root" dir="rtl">
      <div className="ed-nav">
        <button className="ed-back" type="button" onClick={goBack} aria-label="رجوع"><BackIcon /></button>
        <h1>{T.title}</h1>
      </div>

      <div className="ed-list">
        {rows.map((r) => (
          <button key={r.key} type="button" className="ed-row" onClick={() => open(r.key)}>
            <span className="ed-label">{r.label}</span>
            {r.value}
            <CmIcon name="chev" w={12} h={20} className="ed-chev" />
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />

      {editing && (
        <div className="au-overlay" onClick={() => !busy && setEditing(null)} dir="rtl">
          <div className="au-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="au-head">
              <h2>{rows.find((r) => r.key === editing)!.label}</h2>
            </div>
            <div className="au-form">
              {editing === "avatar" && (
                <>
                  <div className="ed-big" style={{ backgroundImage: `url(${pic})` }} />
                  <button className="au-btn" type="button" disabled={busy} onClick={() => fileRef.current?.click()}>
                    {busy ? T.saving : T.pick}
                  </button>
                  {m.avatar_url && (
                    <button
                      className="au-btn"
                      type="button"
                      disabled={busy}
                      style={{ background: "#f5f5f5", color: "#191919", marginTop: 12 }}
                      onClick={() => run(async () => { if (user) await saveProfile(user, { avatarUrl: "" }); })}
                    >
                      {T.reset}
                    </button>
                  )}
                </>
              )}
              {editing === "name" && (
                <input className="au-input" value={val} maxLength={24} placeholder={T.namePh} onChange={(e) => setVal(e.target.value)} autoFocus />
              )}
              {editing === "bio" && (
                <textarea className="au-input" style={{ minHeight: 140, resize: "none" }} value={val} maxLength={120} placeholder={T.bioPh} onChange={(e) => setVal(e.target.value)} autoFocus />
              )}
              {editing === "birthday" && (
                <>
                  <input className="au-input" type="date" dir="ltr" max={new Date().toISOString().slice(0, 10)} value={val} onChange={(e) => setVal(e.target.value)} />
                  <p className="au-hint" style={{ marginTop: 12 }}>{T.birthHint}</p>
                </>
              )}
              {err && <div className="au-msg" style={{ margin: "12px 0 0" }}>{err}</div>}
              {editing !== "avatar" && (
                <button
                  className="au-btn"
                  type="button"
                  disabled={busy || (editing === "name" && val.trim().length < 2)}
                  onClick={save}
                >
                  {busy ? T.saving : T.save}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
