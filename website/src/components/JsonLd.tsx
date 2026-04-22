type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Ronki',
        url: 'https://www.ronki.de',
        logo: 'https://www.ronki.de/favicon-192.png',
        description:
          'Ronki ist ein digitaler Drachen-Gefährte, der Kinder spielerisch durch ihre täglichen Routinen begleitet. Ohne Werbung, ohne Dark Patterns.',
      }}
    />
  );
}

export function SoftwareApplicationSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Ronki',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
        audience: {
          '@type': 'PeopleAudience',
          suggestedMinAge: 5,
          suggestedMaxAge: 9,
        },
      }}
    />
  );
}

type FAQItem = {
  question: string;
  answer: string;
};

export function FAQPageSchema({ items }: { items: FAQItem[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }}
    />
  );
}

/* ── Article schema (for Ratgeber pages) ─────────────────── *
 * Enables rich snippets in Google search (headline, author photo,
 * date) and eligibility for featured snippets / top-stories-style
 * placements. Applied via the RatgeberArticle wrapper so every
 * Ratgeber page automatically gets it.
 * ─────────────────────────────────────────────────────────── */

type ArticleSchemaProps = {
  /** Final page URL, e.g. https://www.ronki.de/ratgeber/morgen-troedeln */
  url: string;
  headline: string;
  description: string;
  /** Absolute URL to the article's og/hero image. */
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
};

export function ArticleSchema({
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'Marc Förster',
}: ArticleSchemaProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        headline,
        description,
        image: [image],
        datePublished,
        dateModified: dateModified ?? datePublished,
        author: {
          '@type': 'Person',
          name: author,
          url: 'https://www.ronki.de',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Ronki',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.ronki.de/favicon-192.png',
          },
        },
      }}
    />
  );
}

/* ── Breadcrumb schema ───────────────────────────────────── *
 * Tells Google the path from Home → Ratgeber → Article. Surfaces
 * as a breadcrumb trail in SERP, also a ranking signal. Applied
 * via RatgeberArticle wrapper with hard-coded Home + Ratgeber
 * ancestors (none of the article pages are deeper nested).
 * ─────────────────────────────────────────────────────────── */

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export function BreadcrumbListSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
