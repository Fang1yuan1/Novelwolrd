export default function LaurelIcon({
  flip = false,
  className = "h-4 w-3",
}: {
  flip?: boolean;
  className?: string;
}) {
  const src = flip ? "/icons/laurel/right.png" : "/icons/laurel/left.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${className} object-contain`} aria-hidden="true" />
  );
}
