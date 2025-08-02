'use client';

import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface ArticleSchemaProps {
  article: PageBlogPostFieldsFragment;
}

export const ArticleSchema = ({ article }: ArticleSchemaProps) => {
  // Extract content text for description (fallback to shortDescription)
  const getArticleDescription = () => {
    return article.shortDescription || article.seoFields?.pageDescription || '';
  };

  // Build the canonical URL
  const getCanonicalUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://blog.rebelfi.com';
    return `${baseUrl}/${article.slug}`;
  };

  // Build the image URL
  const getImageUrl = () => {
    const featuredImageUrl = article.featuredImage?.url;
    if (!featuredImageUrl) return undefined;

    // Ensure the image URL is absolute
    if (featuredImageUrl.startsWith('//')) {
      return `https:${featuredImageUrl}`;
    }
    if (featuredImageUrl.startsWith('/')) {
      return `https://images.ctfassets.net${featuredImageUrl}`;
    }
    return featuredImageUrl;
  };

  // Create the Article schema object
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title || '',
    description: getArticleDescription(),
    image: getImageUrl() ? [getImageUrl()] : undefined,
    datePublished: article.publishedDate,
    dateModified: article.publishedDate, // Using publishedDate as we don't have lastModified
    author: article.author?.name
      ? {
          '@type': 'Person',
          name: article.author.name,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'RebelFi',
      logo: {
        '@type': 'ImageObject',
        url: `${
          process.env.NEXT_PUBLIC_BASE_URL || 'https://blog.rebelfi.com'
        }/images/logo_name.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getCanonicalUrl(),
    },
    url: getCanonicalUrl(),
    isPartOf: {
      '@type': 'Blog',
      name: 'RebelFi Blog',
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://blog.rebelfi.com',
    },
    inLanguage: 'en',
    // Remove undefined values
  };

  // Clean up undefined values from the schema
  const cleanSchema = JSON.parse(
    JSON.stringify(articleSchema, (key, value) => (value === undefined ? undefined : value)),
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema, null, 2),
      }}
    />
  );
};
