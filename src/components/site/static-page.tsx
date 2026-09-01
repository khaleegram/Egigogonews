const copy: Record<string, { title: string; paragraphs: string[] }> = {
  about: {
    title: "About Egigogo Newspaper",
    paragraphs: [
      "Egigogo Newspaper is a credible, independent and professionally managed digital news platform focused on accurate, timely and impactful journalism.",
      "We pay particular attention to Niger State, Northern Nigeria and national affairs — covering politics, governance, security, education, health, business, agriculture, technology, sports, entertainment, community issues, features and investigative reporting.",
      "Our purpose is responsible reporting, public-interest journalism and digital storytelling that informs, educates and gives communities a voice.",
    ],
  },
  contact: {
    title: "Contact",
    paragraphs: [
      "Editorial and general enquiries: news@egigogo.ng (replace with your live address in Settings).",
      "To share a tip securely, use the news tip form — that is our public intake.",
    ],
  },
  privacy: {
    title: "Privacy",
    paragraphs: [
      "We collect only what we need to publish journalism, run the newsletter, and keep the site secure.",
      "Comment emails are not shown publicly. Tip contacts are visible only to editors.",
    ],
  },
  terms: {
    title: "Terms of use",
    paragraphs: [
      "Content on Egigogo Newspaper is for personal informational use unless otherwise licensed.",
      "Do not scrape, republish wholesale, or misrepresent our reporting.",
    ],
  },
  ethics: {
    title: "Editorial ethics",
    paragraphs: [
      "We prioritise accuracy, fairness and public interest. Errors are corrected with transparent updates.",
      "Sponsored content is labelled. Opinion is distinct from news reporting.",
    ],
  },
};

export function StaticPage({ slug }: { slug: keyof typeof copy }) {
  const page = copy[slug];
  return (
    <div className="page-wrap prose-page">
      <h1 className="page-title">{page.title}</h1>
      {page.paragraphs.map((p) => (
        <p key={p.slice(0, 32)}>{p}</p>
      ))}
    </div>
  );
}
