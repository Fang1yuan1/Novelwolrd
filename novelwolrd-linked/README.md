# NovelHub — Frontend Layout Clone (Next.js 15 + React 19 + TypeScript + Tailwind)

واجهة أمامية فقط (Frontend Only) مستوحاة من تخطيط الصفحة الرئيسية لموقع قراءة روايات صيني،
مع استبدال كل الشعارات والصور والنصوص الأصلية بمحتوى Placeholder بالكامل. لا يحتوي المشروع
على أي اتصال حقيقي بقاعدة بيانات أو API — كل البيانات ثابتة (mock) في `lib/placeholder-data.ts`.

## المتطلبات (Requirements)

- Node.js 18.18+ (يفضل 20+)
- npm 10+

## التشغيل محليًا (Run locally)

```bash
npm install
npm run dev
```

ثم افتح المتصفح على: `http://localhost:3000`

## البناء للإنتاج (Production build)

```bash
npm run build
npm run start
```

## بنية المشروع (Project structure)

```
app/
  layout.tsx        # Root layout, global metadata
  page.tsx           # Home page — composes all sections
  globals.css         # Tailwind directives + placeholder-block styles
components/
  Header.tsx          # Top utility bar, logo, search, account
  Navbar.tsx           # Primary category navigation strip
  Sidebar.tsx          # Genre list sidebar
  HeroBanner.tsx       # Main slider + promo tiles + side headlines panel
  NovelCard.tsx        # Reusable book/novel card (horizontal & vertical)
  EditorPicks.tsx      # "Editor's Picks" section built from NovelCard
  RankingSection.tsx   # Single ranking column (used ×5)
  RankingGrid.tsx       # Lays out the 5 ranking columns responsively
  HotWorksPanel.tsx    # Feature block + genre-grouped link columns
  AdSlot.tsx            # Empty, clearly labelled ad placeholder block
  Footer.tsx            # Footer link columns + legal note
lib/
  placeholder-data.ts  # All mock content (genres, books, rankings, nav labels)
```

## ملاحظات

- كل النصوص والعناوين والأغلفة والشعارات Placeholder بالكامل ولا تُمثّل أي عمل حقيقي.
- أماكن الإعلانات (`AdSlot`) موجودة في نفس مواضعها من التصميم الأصلي لكنها فارغة تمامًا.
- التصميم متجاوب (mobile / tablet / desktop) باستخدام Tailwind breakpoints (`sm`, `lg`).
- يمكنك تعديل `lib/placeholder-data.ts` لتغيير كل المحتوى دفعة واحدة دون لمس المكوّنات.
