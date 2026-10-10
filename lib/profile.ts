"use client";

import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const DEFAULT_AVATAR = "/icons/default-avatar.png";

type Meta = { display_name?: string; bio?: string; birthday?: string; avatar_url?: string };
export const metaOf = (u: User | null): Meta => ((u?.user_metadata ?? {}) as Meta);

// يحفظ بيانات الملف بحساب القارئ ويزامنها مع سجله بالمملكة (إن وُجد)
export async function saveProfile(
  user: User,
  patch: Partial<{ name: string; bio: string; birthday: string; avatarUrl: string | null }>
): Promise<void> {
  if (!supabase) throw new Error("offline");
  const m = metaOf(user);
  const next = {
    display_name: patch.name !== undefined ? patch.name.trim().slice(0, 24) : m.display_name,
    bio: patch.bio !== undefined ? patch.bio.trim().slice(0, 120) : m.bio,
    birthday: patch.birthday !== undefined ? patch.birthday : m.birthday,
    avatar_url: patch.avatarUrl !== undefined ? patch.avatarUrl ?? "" : m.avatar_url,
  };
  const { error } = await supabase.auth.updateUser({ data: next });
  if (error) throw new Error(error.message);
  // المزامنة اختيارية: تفشل بصمت إن لم يُشغَّل ملف SQL الخاص بالملف الشخصي أو لم تكن له مشاركات بعد
  await supabase
    .rpc("community_set_profile", {
      p_name: next.display_name ?? "",
      p_avatar_url: next.avatar_url ?? "",
      p_bio: next.bio ?? "",
    })
    .then(
      () => {},
      () => {}
    );
}

// يصغّر الصورة إلى 256×256 (قصّ مركزي) ويرفعها إلى مخزن avatars/{user_id}/avatar.jpg
export async function uploadAvatar(user: User, file: File): Promise<string> {
  if (!supabase) throw new Error("offline");
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, 256, 256);
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.85)
  );
  const path = `${user.id}/avatar.jpg`;
  const { error } = await supabase.storage.from("avatars").upload(path, blob, {
    upsert: true,
    contentType: "image/jpeg",
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
