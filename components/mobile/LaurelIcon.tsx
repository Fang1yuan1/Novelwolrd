export default function LaurelIcon({
  flip = false,
  className = "h-4 w-3",
  variant = "default",
}: {
  flip?: boolean;
  className?: string;
  variant?: "default" | "no";
}) {
  const src =
    variant === "no"
      ? flip
        ? "/icons/laurel/right-no.png"
        : "/icons/laurel/left-no.png"
      : flip
        ? "/icons/laurel/right.png"
        : "/icons/laurel/left.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${className} object-contain`} aria-hidden="true" />
  );
}
