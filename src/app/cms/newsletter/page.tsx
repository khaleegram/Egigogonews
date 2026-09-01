import { NewsletterComposeForm } from "@/components/cms/newsletter-compose-form";
import { emailConfigured } from "@/lib/email";
import {
  getNewsletterStats,
  listNewsletterPickArticles,
} from "@/lib/newsletter-actions";
import { formatPublishedLabel } from "@/lib/story";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const stats = await getNewsletterStats();
  const articles = await listNewsletterPickArticles();

  return (
    <div className="cms-page">
      <header className="cms-page__head">
        <h1>Newsletter</h1>
        <p className="cms-page__lede">
          Confirmed subscribers: <strong>{stats.confirmed}</strong>
          <span className="cms-page__muted"> · total {stats.total}</span>
        </p>
      </header>

      <NewsletterComposeForm
        articles={articles}
        confirmedCount={stats.confirmed}
        emailReady={emailConfigured()}
      />

      <section className="cms-page__section">
        <h2>Recent sends</h2>
        <div className="cms-table-wrap"><table className="cms-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Sent</th>
            </tr>
          </thead>
          <tbody>
            {stats.sends.length === 0 ? (
              <tr>
                <td colSpan={2}>No sends yet.</td>
              </tr>
            ) : (
              stats.sends.map((s) => (
                <tr key={s.id}>
                  <td>{s.subject}</td>
                  <td>{formatPublishedLabel(s.sentAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>
      </section>
    </div>
  );
}
