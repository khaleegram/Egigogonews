import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <BrandLogo variant="footer" href="/" />
          <p className="site-footer__blurb">
            Credible, independent journalism for Niger State, Northern Nigeria
            and national affairs. Truth. Integrity. Impact.
          </p>
        </div>

        <div>
          <h2 className="site-footer__heading">Directory</h2>
          <ul className="site-footer__list">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/archive">Archives</Link>
            </li>
            <li>
              <Link href="/tips">Send a tip</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="site-footer__heading">Legal</h2>
          <ul className="site-footer__list">
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <Link href="/ethics">Editorial ethics</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="site-footer__heading">Daily briefing</h2>
          <p className="site-footer__blurb">
            Headlines to your inbox. Confirm by email after you subscribe.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <p className="site-footer__copy">
        © {new Date().getFullYear()} Egigogo Newspaper. All rights reserved.
      </p>
    </footer>
  );
}
