import MobileCategoryPage from "@/components/mobile/MobileCategoryPage";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const categoryName = decodeURIComponent(name);

  return <MobileCategoryPage categoryName={categoryName} />;
}
