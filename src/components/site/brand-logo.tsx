import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string;
  /** Compact header mark + wordmark */
  variant?: "header" | "footer";
  className?: string;
};

export function BrandLogo({
  href = "/",
  variant = "header",
  className = "",
}: Props) {
  if (variant === "footer") {
    const inner = (
      <span className={`brand-logo brand-logo--footer ${className}`.trim()}>
        <Image
          src="/brand/egigogo-logo-full.jpg"
          alt="Egigogo Newspaper"
          width={160}
          height={160}
          className="brand-logo__full"
          priority={false}
        />
      </span>
    );
    return href ? (
      <Link
        href={href}
        className="brand-logo-link"
        aria-label="Egigogo Newspaper home"
      >
        {inner}
      </Link>
    ) : (
      inner
    );
  }

  const inner = (
    <span className={`brand-logo brand-logo--header ${className}`.trim()}>
      <Image
        src="/brand/egigogo-mark.jpg"
        alt=""
        width={40}
        height={40}
        className="brand-logo__mark"
        priority
      />
      <span className="brand-logo__wordmark" aria-hidden="true">
        <span className="brand-logo__name">Egigogo</span>
        <span className="brand-logo__tag">Newspaper</span>
      </span>
    </span>
  );

  return href ? (
    <Link
      href={href}
      className="brand-logo-link"
      aria-label="Egigogo Newspaper home"
    >
      {inner}
    </Link>
  ) : (
    inner
  );
}
