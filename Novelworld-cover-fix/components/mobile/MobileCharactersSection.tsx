import { getCharactersByNovel } from "@/lib/characters";
import { formatCount } from "@/lib/novels";

export default async function MobileCharactersSection({
  novelId,
}: {
  novelId: number;
}) {
  const characters = await getCharactersByNovel(novelId);
  if (characters.length === 0) return null;

  return (
    <section className="border-t border-ink-300/10 bg-white px-3 py-3">
      <ul className="scroll-thin flex gap-3 overflow-x-auto pb-1">
        {characters.map((c) => (
          <li key={c.id} className="w-[128px] shrink-0 rounded-xl bg-surface p-2.5">
            <div className="flex items-center gap-2">
              {c.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.avatar_url}
                  alt={c.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="ph-block flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[9px]">
                  صورة
                </span>
              )}
              <span className="min-w-0">
                <span className="line-clamp-1 block text-[13px] font-bold text-ink-900">
                  {c.name}
                </span>
                {c.role && (
                  <span className="line-clamp-1 block text-[11px] text-ink-400">
                    {c.role}
                  </span>
                )}
              </span>
            </div>
            {c.description && (
              <p className="line-clamp-2 mt-2 text-[11.5px] leading-snug text-ink-500">
                {c.description}
              </p>
            )}
            <span className="mt-2 flex items-center gap-1 text-[11px] text-ink-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-6.7-4.35-9.3-8.1C.8 9.9 1.7 6.2 5 5c2.2-.8 4.2.2 5 2 .8-1.8 2.8-2.8 5-2 3.3 1.2 4.2 4.9 2.3 7.9C18.7 16.65 12 21 12 21Z" />
              </svg>
              {formatCount(c.likes)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
