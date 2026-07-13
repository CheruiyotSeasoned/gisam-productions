"use client";

import SubPageHeader from "./SubPageHeader";

/**
 * Consistent wrapper + prose styling for legal/policy pages.
 * Children use plain <h2>/<h3>/<p>/<ul>/<li>/<a>; styles are applied below.
 */
export default function LegalPage({
  title,
  subtitle,
  updated,
  html,
  children,
}: {
  title: string;
  subtitle?: string;
  updated?: string;
  /** CMS-managed HTML; when present (non-empty) it overrides the static children. */
  html?: string;
  children: React.ReactNode;
}) {
  const useHtml = typeof html === "string" && html.trim() !== "";
  return (
    <main>
      <SubPageHeader title={title} subtitle={subtitle} crumb={title} />
      <section className="bg-white dark:bg-darkmode">
        <div className="container max-w-3xl">
          {updated && (
            <p className="text-sm text-CadetBlue mb-8">Last updated: {updated}</p>
          )}
          {useHtml ? (
            // Content is authored by trusted admins via the CMS.
            <article className="legal-prose" dangerouslySetInnerHTML={{ __html: html! }} />
          ) : (
            <article className="legal-prose">{children}</article>
          )}
        </div>
      </section>

      <style jsx global>{`
        .legal-prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0B0B0F;
          margin: 2rem 0 0.75rem;
        }
        .legal-prose h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0B0B0F;
          margin: 1.5rem 0 0.5rem;
        }
        .legal-prose p {
          color: #5C5C66;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .legal-prose ul {
          list-style: disc;
          padding-left: 1.4rem;
          margin-bottom: 1rem;
          color: #5C5C66;
        }
        .legal-prose ul li {
          margin-bottom: 0.4rem;
          line-height: 1.7;
        }
        .legal-prose a {
          color: #E11D2E;
          text-decoration: underline;
        }
        .legal-prose strong {
          color: #0B0B0F;
        }
        :root[class~="dark"] .legal-prose h2,
        :root[class~="dark"] .legal-prose h3,
        :root[class~="dark"] .legal-prose strong {
          color: #fff;
        }
        :root[class~="dark"] .legal-prose p,
        :root[class~="dark"] .legal-prose ul {
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </main>
  );
}
