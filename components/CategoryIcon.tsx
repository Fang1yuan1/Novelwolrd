export default function CategoryIcon({
  icon,
  className = "text-xl",
  imgClassName = "h-6 w-6 object-contain",
}: {
  icon: string | null;
  className?: string;
  imgClassName?: string;
}) {
  if (icon && icon.startsWith("/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" className={imgClassName} />;
  }
  return (
    <span className={className} aria-hidden>
      {icon || "📚"}
    </span>
  );
}
