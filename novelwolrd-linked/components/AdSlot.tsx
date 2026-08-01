type AdSlotProps = {
  label?: string;
  className?: string;
  height?: string;
};

/**
 * مكان إعلان فارغ وموسوم بوضوح. كل موضع إعلان من التصميم الأصلي
 * محفوظ من حيث البنية لكنه لا يحتوي على أي محتوى إعلاني حقيقي.
 */
export default function AdSlot({
  label = "مكان إعلان",
  className = "",
  height = "h-24",
}: AdSlotProps) {
  return (
    <div
      role="complementary"
      aria-label={label}
      className={`ph-block w-full ${height} rounded border border-dashed border-ink-300/60 text-[11px] font-medium tracking-wide ${className}`}
    >
      {label}
    </div>
  );
}
