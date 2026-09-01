import Link from "next/link";
type Props = { params: Promise<{ id: string }> };
export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  return (
    <>
      <p className="sponsored-label">Preview — not public</p>
      <h1>Article preview</h1>
      <p><Link href={`/cms/articles/${id}`}>Back to editor</Link></p>
    </>
  );
}
