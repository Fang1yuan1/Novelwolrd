"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import LoginSheet from "@/components/auth/LoginSheet";

type AuthCtx = {
  user: User | null;
  ready: boolean;
  /** يفتح نافذة الدخول، وينفّذ onSuccess بعد نجاح الدخول (إن لم تُعد الصفحة تحميلها) */
  openLogin: (onSuccess?: () => void) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  ready: false,
  openLogin: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(Ctx);

// اسم العرض: الاسم المعدَّل ثم اسم غوغل ثم الجزء الأول من البريد
export function displayNameOf(u: User | null): string {
  if (!u) return "";
  const m = (u.user_metadata ?? {}) as Record<string, unknown>;
  const raw =
    (m.display_name as string) ||
    (m.full_name as string) ||
    (m.name as string) ||
    (u.email ? u.email.split("@")[0] : "") ||
    "قارئ";
  let n = raw.trim().replace(/\s+/g, " ").slice(0, 24);
  if (n.length < 2) n = "قارئ " + (n || "");
  return n.trim();
}

export function avatarOf(u: User | null): string | null {
  const m = (u?.user_metadata ?? {}) as Record<string, unknown>;
  return ((m.avatar_url as string) || (m.picture as string) || null) ?? null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const pending = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session) {
        setOpen(false);
        const cb = pending.current;
        pending.current = null;
        if (cb) setTimeout(cb, 50);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const openLogin = useCallback((onSuccess?: () => void) => {
    pending.current = onSuccess ?? null;
    setOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, ready, openLogin, signOut }}>
      {children}
      {open && <LoginSheet onClose={() => setOpen(false)} />}
    </Ctx.Provider>
  );
}
