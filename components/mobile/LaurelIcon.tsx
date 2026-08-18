export default function LaurelIcon({
  flip = false,
  className = "h-3.5 w-3.5",
}: {
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path d="M20 3c-3 6-3 12-9 18" strokeLinejoin="round" />
      <path d="M13 6c-1.6.3-2.6 1-3.2 1.8" />
      <path d="M11.3 9.4c-1.6.1-2.7.7-3.5 1.4" />
      <path d="M9.7 12.6c-1.6 0-2.8.5-3.7 1.1" />
      <path d="M8.4 15.8c-1.5-.2-2.7.1-3.8.6" />
      <path d="M7.4 18.8c-1.4-.4-2.6-.3-3.8 0" />
    </svg>
  );
}
