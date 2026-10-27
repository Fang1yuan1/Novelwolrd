# نشر الموقع على Cloudflare (مجانًا) بدل Vercel

الملفات المضافة: `wrangler.jsonc` و`open-next.config.ts` (إعداد التشغيل على Cloudflare)، وسكربتات `cf:build` و`cf:deploy` بـ`package.json`.
الموقع على Vercel لا يتأثر بها.

أوامر البناء بلوحة Cloudflare (Workers & Pages ← Create ← Import a repository):
- Build command:  `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Variables (Build): NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY
- Variables/Secrets (Runtime): R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, ADMIN_API_SECRET
