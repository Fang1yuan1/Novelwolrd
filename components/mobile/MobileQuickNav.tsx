import {
  CategoriesIcon,
  RankingIcon,
  FreeIcon,
  CompletedIcon,
  AuthorsIcon,
  BooklistsIcon,
} from "./icons/QuickNavIcons";

const items: {
  label: string;
  Icon: (props: { className?: string }) => JSX.Element;
  href: string;
}[] = [
  { label: "التصنيفات", Icon: CategoriesIcon, href: "/categories" },
  { label: "الترتيب", Icon: RankingIcon, href: "/rankings" },
  { label: "مجاني", Icon: FreeIcon, href: "/categories" },
  { label: "مكتمل", Icon: CompletedIcon, href: "/completed" },
  { label: "كتّاب مميزون", Icon: AuthorsIcon, href: "/rankings" },
  { label: "قوائم الكتب", Icon: BooklistsIcon, href: "/categories" },
];

export default function MobileQuickNav() {
  return (
    <nav
      aria-label="روابط سريعة"
      className="mt-2 grid grid-cols-6 gap-y-2 bg-white px-1 py-3"
    >
      {items.map(({ label, Icon, href }) => (
        <a key={label} href={href} className="flex flex-col items-center gap-1">
          <Icon className="h-11 w-11" />
          <span className="line-clamp-1 text-[10.5px] text-ink-700">
            {label}
          </span>
        </a>
      ))}
    </nav>
  );
}
