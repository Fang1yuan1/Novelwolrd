import type { Novel } from "@/lib/novels";

export default function DescriptionCard({ novel }: { novel: Novel }) {
  return (
    <div className="rounded bg-white p-3 border border-ink-300/15">
      <h2 className="mb-2 border-b border-ink-300/20 pb-2 text-sm font-bold text-ink-900">
        نبذة عن العمل
      </h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
        {novel.description || "لا يوجد وصف لهذا العمل بعد."}
      </p>
    </div>
  );
}
