import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// لو المتغيرات ناقصة (مثلاً أثناء التطوير المحلي بدون .env.local)
// ما نرمي خطأ يوقف الموقع بالكامل — بس العميل ما راح يرجع بيانات حقيقية.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
