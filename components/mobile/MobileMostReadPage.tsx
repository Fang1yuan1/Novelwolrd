import { getNovels, parseCategories, formatCount } from "@/lib/novels";
import MobileGenderHeader from "./MobileGenderHeader";

const LIMIT = 17;

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

// نطاق الأسبوع الحالي (السبت → الجمعة) — تاريخ حقيقي محسوب من اليوم، مش وهمي
function currentWeekRange(): string {
  const now = new Date();
  const day = now.getDay(); // 0=الأحد ... 6=السبت
  const diffToSaturday = (day + 1) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToSaturday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

export default async function MobileMostReadPage() {
  const all = await getNovels();
  const picks = [...all]
    .sort((a, b) => (b.chapter_count ?? 0) - (a.chapter_count ?? 0))
    .slice(0, LIMIT);

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader
        title="الأكثر قراءة"
        rightSlot={
          <>
            <a href="/" aria-label="بحث" className="mobile-gender-icon-btn">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/header/search.png" alt="" className="h-[19px] w-[19px] object-contain" aria-hidden="true" />
            </a>
            <a href="/" aria-label="القائمة" className="mobile-gender-icon-btn">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/header/menu.png" alt="" className="h-[19px] w-[19px] object-contain" aria-hidden="true" />
            </a>
          </>
        }
      />
      <div className="mobile-reference-content">
        <p className="px-3 pt-3 text-[13px] text-ink-400">{currentWeekRange()}</p>

        {picks.length === 0 ? (
          <p className="mobile-category-empty">لا توجد أعمال كافية حاليًا.</p>
        ) : (
          <ul className="flex flex-col gap-3 px-3 pb-4 pt-3">
            {picks.map((n) => {
              const cats = parseCategories(n.category);
              return (
                <li key={n.id} className="mobile-pick-card">
                  <a href={`/novel/${n.id}`} className="flex items-start gap-3">
                    {n.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.cover_url} alt={n.title} className="mobile-pick-cover" />
                    ) : (
                      <span className="ph-block mobile-pick-cover text-[9px]">الغلاف</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-bold text-ink-900">{n.title}</span>
                      {n.description && (
                        <span className="line-clamp-1 mt-1 block text-[13px] text-ink-400">
                          {n.description}
                        </span>
                      )}
                      <span className="mt-1 block text-[12px] text-ink-400">
                        {n.author || "غير معروف"}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {cats[0] && <span className="mobile-pick-tag">{cats[0]}</span>}
                        {n.status && (
                          <span className="mobile-pick-tag">
                            {n.status === "completed" ? "مكتملة" : "مستمرة"}
                          </span>
                        )}
                        {typeof n.word_count === "number" && n.word_count > 0 && (
                          <span className="mobile-pick-tag">
                            {formatCount(n.word_count)} حرف
                          </span>
                        )}
                      </span>
                    </span>
                  </a>

                  {n.description && (
                    <p className="mobile-pick-quote line-clamp-3">“{n.description}”</p>
                  )}

                  <div className="mt-3 flex gap-2.5">
                    <a href={`/novel/${n.id}/chapter/1`} className="mobile-pick-btn">
                      ابدأ القراءة
                    </a>
                    <button type="button" className="mobile-pick-btn mobile-pick-btn--accent">
                      أضف لمكتبتي
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
