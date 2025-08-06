'use client';

import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  article: PageBlogPostFieldsFragment;
  faqData?: FAQItem[];
}

export const FAQSchema = ({ article, faqData }: FAQSchemaProps) => {
  if (!faqData || faqData.length === 0) {
    return null;
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      key="faq-schema"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema, null, 2),
      }}
    />
  );
};
