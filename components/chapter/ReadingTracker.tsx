"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

// يسجّل قراءة الفصل لحساب القارئ (للإحصائيات بصفحة «حسابي»): عند الفتح، ثم +30 ثانية كل نصف دقيقة والصفحة ظاهرة
export default function ReadingTracker({ novelId, chapterId }: { novelId: number; chapterId: number }) {
  const { user } = useAuth();
  const uid = user?.id;

  useEffect(() => {
    if (!supabase || !uid) return;
    const send = (seconds: number) => {
      supabase!
        .rpc("reading_track", { p_novel_id: novelId, p_chapter_id: chapterId, p_seconds: seconds })
        .then(() => {}, () => {});
    };
    send(0);
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") send(30);
    }, 30000);
    return () => window.clearInterval(t);
  }, [uid, novelId, chapterId]);

  return null;
}
