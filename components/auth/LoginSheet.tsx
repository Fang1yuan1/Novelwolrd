"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Step = "choose" | "email" | "code";

const T = {
  title: "تسجيل الدخول / إنشاء حساب",
  agree:
    "قرأتُ ووافقتُ على شروط الاستخدام وسياسة الخصوصية، وسيُنشأ حسابك تلقائيًا عند أول تسجيل دخول.",
  needAgree: "يرجى الموافقة على الشروط أولًا.",
  emailTitle: "الدخول بالبريد الإلكتروني",
  emailPh: "بريدك الإلكتروني",
  sendCode: "إرسال الرمز",
  sending: "جارٍ الإرسال…",
  codeTitle: "تفقّد بريدك",
  codeHint: (e: string) => `أرسلنا رسالة إلى ${e}. افتحها واضغط زر «Sign in» بداخلها للدخول مباشرة، أو أدخل الرمز هنا إن وصلك رمز.`,
  codePh: "رمز التحقق (إن وصلك)",
  verify: "دخول",
  back: "رجوع",
  badEmail: "اكتب بريدًا إلكترونيًا صحيحًا.",
  fail: "تعذّر إكمال العملية، حاول مرة أخرى.",
  badCode: "الرمز غير صحيح أو انتهت صلاحيته.",
};

export default function LoginSheet({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("choose");
  const [agree, setAgree] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function guard(): boolean {
    if (!agree) {
      setMsg(T.needAgree);
      return false;
    }
    setMsg("");
    return true;
  }

  async function google() {
    if (!guard() || !supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (error) setMsg(T.fail);
  }

  async function sendCode() {
    if (!supabase) return;
    const e = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(e)) return setMsg(T.badEmail);
    setBusy(true);
    setMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: { shouldCreateUser: true, emailRedirectTo: window.location.href },
    });
    setBusy(false);
    if (error) return setMsg(T.fail);
    setStep("code");
  }

  async function verify() {
    if (!supabase) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) setMsg(T.badCode);
    // عند النجاح يغلق AuthProvider النافذة تلقائيًا
  }

  return (
    <div className="au-overlay" onClick={onClose} dir="rtl">
      <div className="au-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={T.title}>
        <div className="au-head">
          <h2>{step === "choose" ? T.title : step === "email" ? T.emailTitle : T.codeTitle}</h2>
          {step !== "choose" && (
            <button className="au-back" type="button" onClick={() => { setMsg(""); setStep(step === "code" ? "email" : "choose"); }}>
              {T.back}
            </button>
          )}
        </div>

        {step === "choose" && (
          <>
            <div className="au-circles">
              <button type="button" className="au-circle au-google" onClick={google} aria-label="Google">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/community/google.png" alt="" />
              </button>
              <button
                type="button"
                className="au-circle au-mail"
                onClick={() => guard() && setStep("email")}
                aria-label="البريد الإلكتروني"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/community/mail.png" alt="" />
              </button>
            </div>
            {msg && <div className="au-msg">{msg}</div>}
            <label className="au-agree">
              <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setMsg(""); }} />
              <span className="au-ring" aria-hidden />
              <span>{T.agree}</span>
            </label>
          </>
        )}

        {step === "email" && (
          <div className="au-form">
            <input
              className="au-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              placeholder={T.emailPh}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
              autoFocus
            />
            {msg && <div className="au-msg">{msg}</div>}
            <button className="au-btn" type="button" disabled={busy || !email.trim()} onClick={sendCode}>
              {busy ? T.sending : T.sendCode}
            </button>
          </div>
        )}

        {step === "code" && (
          <div className="au-form">
            <p className="au-hint">{T.codeHint(email.trim())}</p>
            <input
              className="au-input au-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              maxLength={8}
              placeholder={T.codePh}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              autoFocus
            />
            {msg && <div className="au-msg">{msg}</div>}
            <button className="au-btn" type="button" disabled={busy || code.length < 6} onClick={verify}>
              {T.verify}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
