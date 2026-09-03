import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";

const TOC = [
  { id: "login", label: "1. Sign in" },
  { id: "install", label: "2. Install on your phone" },
  { id: "roles", label: "3. Who can do what" },
  { id: "publish", label: "4. Publish a story" },
  { id: "photos", label: "5. Photos" },
  { id: "featured", label: "6. Homepage banner" },
  { id: "workflow", label: "7. Draft → publish" },
  { id: "share", label: "8. Share a story" },
  { id: "tools", label: "9. Other CMS tools" },
  { id: "limits", label: "10. Limits & formats" },
  { id: "fixes", label: "11. Common problems" },
] as const;

export default function StaffGuidePage() {
  return (
    <div className="staff-guide">
      <header className="staff-guide__top">
        <div className="staff-guide__top-inner">
          <BrandLogo variant="header" href="/" />
          <div className="staff-guide__top-actions">
            <Link href="/login" className="btn">
              Staff login
            </Link>
            <Link href="/cms" className="btn btn--ghost">
              Open CMS
            </Link>
          </div>
        </div>
      </header>

      <div className="staff-guide__hero">
        <p className="staff-guide__eyebrow">Internal · not linked from the public site</p>
        <h1 className="staff-guide__title">Egigogo staff manual</h1>
        <p className="staff-guide__lede">
          Everything you need to install the phone app, log in, write, add
          photos, publish, and put a story on the homepage banner. Bookmark this
          page and share the link with your team.
        </p>
        <p className="staff-guide__url">
          Link to share:{" "}
          <code>https://egigogonewspaper.com/staff-guide</code>
        </p>
      </div>

      <div className="staff-guide__layout">
        <nav className="staff-guide__toc" aria-label="Manual sections">
          <p className="staff-guide__toc-label">On this page</p>
          <ol>
            {TOC.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="staff-guide__main">
          <section id="login" className="staff-guide__section">
            <h2>1. Sign in</h2>
            <ol className="staff-guide__steps">
              <li>
                Go to{" "}
                <Link href="/login">
                  <code>/login</code>
                </Link>{" "}
                — or open the site menu (☰) and tap <strong>Staff login</strong>{" "}
                at the top, or scroll the footer → <strong>Staff login</strong>.
              </li>
              <li>Enter the email and password your admin gave you.</li>
              <li>
                You land in the <strong>CMS</strong> (content dashboard). On
                phone, use the bottom tabs: Home, Articles, Media, Tips, More.
              </li>
            </ol>
            <div className="staff-guide__callout">
              <strong>Phone app (PWA):</strong> the address bar may be hidden.
              Use <strong>Staff login</strong> in the hamburger or footer — you
              do not need to type a URL.
            </div>
          </section>

          <section id="install" className="staff-guide__section">
            <h2>2. Install on your phone (PWA)</h2>
            <p>
              Egigogo can sit on the home screen like an app. Whether Install
              appears depends on the phone and browser — that is normal.
            </p>
            <div className="staff-guide__grid">
              <article className="staff-guide__card">
                <h3>Android</h3>
                <p>
                  Open the site in <strong>Chrome</strong>. You should get an{" "}
                  <strong>Install</strong> prompt or banner — tap it. Or use the
                  browser menu → <strong>Install app</strong> /{" "}
                  <strong>Add to Home screen</strong>.
                </p>
              </article>
              <article className="staff-guide__card">
                <h3>iPhone / iPad</h3>
                <p>
                  Apple does <strong>not</strong> show a one-tap Install button
                  like Android. You must add it manually:
                </p>
                <ol className="staff-guide__steps">
                  <li>
                    Open <strong>https://egigogonewspaper.com</strong> in{" "}
                    <strong>Safari</strong> (not Chrome, not WhatsApp /
                    Instagram / Facebook’s in-app browser).
                  </li>
                  <li>Tap the <strong>Share</strong> button (square with arrow).</li>
                  <li>
                    Tap <strong>Add to Home Screen</strong>, then Add.
                  </li>
                </ol>
              </article>
            </div>
            <div className="staff-guide__callout staff-guide__callout--warn">
              <strong>If Install doesn’t show on iPhone:</strong> she is
              probably not in Safari, or she opened the link inside another app.
              Copy the site URL → open Safari → paste → then Share → Add to Home
              Screen.
            </div>
            <ul className="staff-guide__bullets">
              <li>
                Already installed, or tapped “Not now” before — the banner may
                stay hidden.
              </li>
              <li>
                After install, use <strong>Staff login</strong> in the menu or
                footer to reach the CMS (no address bar on some phones).
              </li>
            </ul>
          </section>

          <section id="roles" className="staff-guide__section">
            <h2>3. Who can do what</h2>
            <p>
              Your account has a role. The menu only shows what you are allowed
              to use.
            </p>
            <div className="staff-guide__table-wrap">
              <table className="staff-guide__table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Admin</th>
                    <th>Editor</th>
                    <th>Reporter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Write &amp; edit own drafts</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Upload photos / audio</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Publish / unpublish / schedule</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Feature on homepage banner</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Breaking, tips, comments</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Users, settings, categories, ads, newsletter</td>
                    <td>✓</td>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="staff-guide__note">
              Reporters write and submit for review. Editors and admins publish.
            </p>
          </section>

          <section id="publish" className="staff-guide__section">
            <h2>4. Publish a story (checklist)</h2>
            <ol className="staff-guide__steps">
              <li>
                CMS → <strong>Articles</strong> → <strong>New article</strong>{" "}
                (or <strong>More</strong> → New article on phone).
              </li>
              <li>
                Add a <strong>title</strong> and pick a <strong>category</strong>{" "}
                (Politics, Security, etc.).
              </li>
              <li>
                Write the story in the big editor. Optional: short summary under
                the title, location, author name.
              </li>
              <li>
                Set a <strong>Cover photo</strong> on the right (see Photos
                below). This is required if you want your picture on the site —
                not just inside the text.
              </li>
              <li>
                Click <strong>Save</strong> (or Save draft). Always save before
                you leave the page.
              </li>
              <li>
                When ready: editors/admins click <strong>Publish now</strong>.
                Reporters click <strong>Submit for review</strong>.
              </li>
            </ol>
            <div className="staff-guide__callout staff-guide__callout--ok">
              <strong>Minimum to publish:</strong> title + category. Summary and
              byline can auto-fill if you leave them blank.
            </div>
          </section>

          <section id="photos" className="staff-guide__section">
            <h2>5. Photos — cover vs story images</h2>
            <div className="staff-guide__grid">
              <article className="staff-guide__card">
                <h3>Cover photo (one per story)</h3>
                <p>
                  The big image on the <strong>homepage</strong>, story{" "}
                  <strong>cards</strong>, and the <strong>top of the article</strong>.
                </p>
                <p>
                  In the editor sidebar: <strong>Cover photo</strong> →{" "}
                  <strong>Add cover photo</strong> → upload or pick from library →{" "}
                  <strong>Save</strong>.
                </p>
              </article>
              <article className="staff-guide__card">
                <h3>Images inside the story</h3>
                <p>
                  Extra pictures in the article body. Use the{" "}
                  <strong>Image</strong> button in the story editor. You can add{" "}
                  <strong>many</strong>.
                </p>
                <p>
                  If you have no cover yet, the first body image is also used as
                  the cover when you save.
                </p>
              </article>
            </div>
            <div className="staff-guide__callout staff-guide__callout--warn">
              <strong>Why the wrong picture showed up:</strong> uploading only
              into the story text (or only into Media) does <em>not</em> set the
              cover. Without a cover, the site used a blank placeholder. Always
              set <strong>Cover photo</strong>, then Save.
            </div>
          </section>

          <section id="featured" className="staff-guide__section">
            <h2>6. Homepage banner (featured)</h2>
            <p>
              Publishing does <strong>not</strong> automatically put a story in
              the big rotating banner at the top of the homepage.
            </p>
            <ol className="staff-guide__steps">
              <li>Open the article (editors/admins only).</li>
              <li>
                Tick <strong>Featured on home</strong> (near Cover photo).
              </li>
              <li>Save / publish.</li>
            </ol>
            <ul className="staff-guide__bullets">
              <li>Up to about <strong>3</strong> featured stories rotate in the banner.</li>
              <li>Newest featured stories appear first.</li>
              <li>Featured stories are kept out of the “Latest” row so they don’t repeat.</li>
            </ul>
          </section>

          <section id="workflow" className="staff-guide__section">
            <h2>7. Draft → review → publish</h2>
            <div className="staff-guide__flow">
              <div>
                <strong>Draft</strong>
                <span>Work in progress. Not on the public site.</span>
              </div>
              <div>
                <strong>In review</strong>
                <span>Reporter submitted it. Editor decides.</span>
              </div>
              <div>
                <strong>Scheduled</strong>
                <span>Goes live at the date/time you set.</span>
              </div>
              <div>
                <strong>Published</strong>
                <span>Live on the website. Readers can open it.</span>
              </div>
            </div>
            <p className="staff-guide__note">
              Editors can <strong>Return</strong> a story to the reporter with a
              note, or add a dated <strong>update</strong> without rewriting the
              whole piece. Use <strong>Unpublish</strong> to take a live story
              down.
            </p>
          </section>

          <section id="share" className="staff-guide__section">
            <h2>8. Share a published story</h2>
            <p>
              After a story is <strong>published</strong>, the article editor
              shows share buttons (WhatsApp, Facebook, X, copy link, view on
              site). Those links go to the <strong>public</strong> story URL —
              the one readers open.
            </p>
          </section>

          <section id="tools" className="staff-guide__section">
            <h2>9. Other CMS tools</h2>
            <dl className="staff-guide__dl">
              <div>
                <dt>Media</dt>
                <dd>
                  Photo and audio library. Upload once, reuse on many stories.
                  Still set Cover photo on each article.
                </dd>
              </div>
              <div>
                <dt>Tips</dt>
                <dd>Public tip submissions for the newsroom to review.</dd>
              </div>
              <div>
                <dt>Breaking</dt>
                <dd>Breaking-news strip / alerts (editors &amp; admins).</dd>
              </div>
              <div>
                <dt>Comments</dt>
                <dd>Moderate reader comments.</dd>
              </div>
              <div>
                <dt>Newsletter / Ads / Categories / Users / Settings</dt>
                <dd>Admin only (editors do not see these in the menu).</dd>
              </div>
            </dl>
          </section>

          <section id="limits" className="staff-guide__section">
            <h2>10. Limits &amp; formats</h2>
            <ul className="staff-guide__bullets">
              <li>
                <strong>Images:</strong> JPEG, PNG, or WebP — max{" "}
                <strong>8 MB</strong> each.
              </li>
              <li>
                <strong>iPhone:</strong> HEIC is not supported. In Photos, export
                / share as <strong>JPEG</strong>, then upload.
              </li>
              <li>
                <strong>Audio:</strong> MP3 or M4A — max <strong>25 MB</strong>.
              </li>
              <li>
                <strong>Cover photos:</strong> one per story. Body images:
                unlimited.
              </li>
              <li>
                <strong>Titles:</strong> two stories can share a similar title;
                the site makes the web address unique automatically.
              </li>
            </ul>
          </section>

          <section id="fixes" className="staff-guide__section">
            <h2>11. Common problems</h2>
            <dl className="staff-guide__dl">
              <div>
                <dt>Blank / “no cover” image on the site</dt>
                <dd>
                  Open the article → <strong>Add cover photo</strong> → Save.
                  Publishing alone does not invent a photo.
                </dd>
              </div>
              <div>
                <dt>Story is live but not in the top banner</dt>
                <dd>
                  Tick <strong>Featured on home</strong>, then Save. Publish ≠
                  featured.
                </dd>
              </div>
              <div>
                <dt>Can’t install on iPhone</dt>
                <dd>
                  Use <strong>Safari</strong> only → Share →{" "}
                  <strong>Add to Home Screen</strong>. Chrome and in-app
                  browsers (WhatsApp, Instagram, Facebook) usually won’t offer a
                  proper install.
                </dd>
              </div>
              <div>
                <dt>Can’t find login on the phone app</dt>
                <dd>
                  Open ☰ → <strong>Staff login</strong> (first item), or footer →
                  Staff login.
                </dd>
              </div>
              <div>
                <dt>Reporter can’t publish</dt>
                <dd>
                  Normal. Use <strong>Submit for review</strong>. An editor or
                  admin publishes.
                </dd>
              </div>
              <div>
                <dt>Upload fails from iPhone</dt>
                <dd>Convert HEIC to JPEG first, stay under 8 MB.</dd>
              </div>
            </dl>
          </section>

          <section className="staff-guide__section staff-guide__section--end">
            <h2>Quick start</h2>
            <ol className="staff-guide__steps">
              <li>Login → New article</li>
              <li>Title + category + story text</li>
              <li>Cover photo → Save</li>
              <li>Publish (or submit for review)</li>
              <li>Optional: Featured on home for the big banner</li>
            </ol>
            <div className="staff-guide__end-actions">
              <Link href="/login" className="btn">
                Go to login
              </Link>
              <Link href="/cms" className="btn btn--ghost">
                Open CMS
              </Link>
              <Link href="/" className="btn btn--ghost">
                View public site
              </Link>
            </div>
          </section>
        </main>
      </div>

      <footer className="staff-guide__foot">
        <p>
          Egigogo Newspaper · staff manual ·{" "}
          <code>/staff-guide</code> · not listed in public navigation
        </p>
      </footer>
    </div>
  );
}
