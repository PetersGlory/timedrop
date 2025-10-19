'use client';

// Organization Schema for Timedrop
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Timedrop',
    url: 'https://timedrop.live',
    logo: 'https://timedrop.live/logo.png',
    description: 'Timedrop is a prediction market platform where users can predict future events, trade Yes/No shares, and compete with others in forecasting markets across various categories including finance, sports, politics, and technology.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/timedrop',
      'https://linkedin.com/company/timedrop',
      'https://facebook.com/timedrop',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@timedrop.live',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    serviceType: 'Prediction Market Platform',
    offers: {
      '@type': 'Offer',
      name: 'Prediction Market Trading',
      description: 'Trade Yes/No shares on future events and predictions',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website Schema for Timedrop
export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Timedrop',
    url: 'https://timedrop.live',
    description: 'Browse and predict on a variety of future events. Join Timedrop to make forecasts, track predictions, and compete with others in our prediction market platform.',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://timedrop.live?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Timedrop',
      url: 'https://timedrop.live',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Financial Service Schema for prediction markets
export function FinancialServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Timedrop Prediction Markets',
    description: 'A financial platform for prediction market trading where users can buy and sell shares on future events',
    url: 'https://timedrop.live',
    provider: {
      '@type': 'Organization',
      name: 'Timedrop',
    },
    serviceType: 'Prediction Market Trading',
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    feesAndCommissionsSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '0',
      priceCurrency: 'NGN',
      description: 'Free to join, trading fees may apply',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema for navigation
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema for common questions
export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
