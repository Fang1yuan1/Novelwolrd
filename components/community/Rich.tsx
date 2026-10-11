"use client";

// نص المنشور: **غامق**، روابط https، وإشارات @الاسم
export default function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|https?:\/\/[^\s]+|@[^\s@]{1,24})/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (/^https?:\/\//.test(p))
          return (
            <a key={i} href={p} target="_blank" rel="noopener noreferrer nofollow ugc" className="cm-link" onClick={(e) => e.stopPropagation()}>
              {p}
            </a>
          );
        if (p.length > 1 && p.startsWith("@")) return <span key={i} className="cm-mention">{p}</span>;
        return p;
      })}
    </>
  );
}
