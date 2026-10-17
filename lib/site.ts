// عنوان الموقع الأساسي (للروابط الكاملة بخريطة الموقع وبطاقات المشاركة). غيّره بمتغير NEXT_PUBLIC_SITE_URL بـVercel لو تغيّر الدومين.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.novelwolrd.com").replace(/\/$/, "");
export const SITE_NAME = "عالم الروايات";
