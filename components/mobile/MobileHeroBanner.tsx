import { getNovels } from "@/lib/novels";

export default async function MobileHeroBanner() {
  const novels = await getNovels(5);
  const slides = novels.filter((n) => n.cover_url);

  if (slides.length === 0) return null;

  return (
    <div className="scroll-thin flex snap-x snap-mandatory overflow-x-auto bg-white">
      {slides.map((n) => (
        <a
          key={n.id}
          href={`/novel/${n.id}`}
          className="relative block aspect-[3/1] w-full shrink-0 snap-center overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={n.cover_url as string}
            alt={n.title}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2">
            <span className="line-clamp-1 block text-sm font-semibold text-white">
              {n.title}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
