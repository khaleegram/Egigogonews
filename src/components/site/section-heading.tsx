import Link from "next/link";

export function SectionHeading({
  title,
  href,
  seeAll = true,
}: {
  title: string;
  href?: string;
  seeAll?: boolean;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {href && seeAll ? (
        <Link href={href} className="section-heading__all">
          See all
        </Link>
      ) : null}
    </div>
  );
}
