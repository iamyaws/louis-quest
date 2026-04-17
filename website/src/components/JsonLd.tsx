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
