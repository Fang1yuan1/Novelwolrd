const items: {
  label: string;
  emoji: string;
  gradient: string;
  href: string | null;
}[] = [
  {
    label: "التصنيفات",
    emoji: "🗂️",
    gradient: "from-rose-400 to-rose-500",
    href: "/categories",
  },
  {
    label: "الترتيب",
    emoji: "🏆",
    gradient: "from-violet-400 to-violet-500",
    href: "/rankings",
  },
  {
    label: "مجاني",
    emoji: "🌱",
    gradient: "from-emerald-400 to-emerald-500",
    href: "/categories",
  },
  {
    label: "مكتمل",
    emoji: "📘",
    gradient: "from-blue-400 to-blue-500",
    href: "/completed",
  },
  {
    label: "كتّاب مميزون",
    emoji: "👑",
    gradient: "from-amber-400 to-amber-500",
    href: "/rankings",
  },
  {
    label: "قوائم الكتب",
    emoji: "📑",
    gradient: "from-teal-400 to-teal-500",
    href: "/categories",
  },
];

export default function MobileQuickNav() {
  return (
    <nav
      aria-label="روابط سريعة"
      className="mt-2 grid grid-cols-6 gap-y-3 bg-white px-1 py-3"
    >
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href ?? "#"}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-xl shadow-sm`}
          >
            {item.emoji}
          </span>
          <span className="line-clamp-1 text-[10.5px] text-ink-700">
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
