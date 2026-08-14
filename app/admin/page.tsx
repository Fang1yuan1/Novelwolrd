export default function AdminDashboard() {
  const links = [
    {
      href: '/admin/novel',
      title: 'إضافة رواية جديدة',
      desc: 'عنوان، مؤلف، نبذة، حالة، وسوم، غلاف، تصنيفات',
      icon: '➕',
    },
    {
      href: '/admin/edit',
      title: 'الروايات — تعديل وحذف',
      desc: 'تعديل بيانات أي رواية، أو حذفها نهائيًا مع فصولها',
      icon: '✏️',
    },
    {
      href: '/admin/categories',
      title: 'التصنيفات',
      desc: 'إضافة أو حذف تصنيفات الموقع (بالإيموجي)',
      icon: '🏷️',
    },
    {
      href: '/admin/upload',
      title: 'رفع فصول',
      desc: 'رفع دفعة فصول لرواية موجودة عبر ملف JSON',
      icon: '📥',
    },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 font-sans text-ink-900">
      <h1 className="mb-1 text-xl font-bold">لوحة التحكم</h1>
      <p className="mb-6 text-[13px] text-ink-500">كل أدوات إدارة الموقع في مكان واحد</p>

      <div className="flex flex-col gap-3">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 rounded border border-ink-300/25 p-4 hover:border-brand"
          >
            <span className="text-2xl">{l.icon}</span>
            <span>
              <span className="block text-sm font-semibold text-ink-900">{l.title}</span>
              <span className="block text-[12px] text-ink-500">{l.desc}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
