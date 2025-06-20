import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { ArticleContent, ArticleHero, ArticleTileGrid } from '@src/components/features/article';
import { Container } from '@src/components/shared/container';
import { NewsletterSignup } from '@src/components/shared/newsletter-signup';
import initTranslations from '@src/i18n';
import { client, previewClient } from '@src/lib/client';
import { PageBlogPostOrder, SeoFieldsFragment } from '@src/lib/__generated/sdk';

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<BlogPageProps['params'][]> {
  const gqlClient = client;
  const { pageBlogPostCollection } = await gqlClient.pageBlogPostCollection({ locale, limit: 100 });

  if (!pageBlogPostCollection?.items) {
    throw new Error('No blog posts found');
  }

  return pageBlogPostCollection.items
    .filter((blogPost): blogPost is NonNullable<typeof blogPost> => Boolean(blogPost?.slug))
    .map(blogPost => {
      console.log('blogPost.seoFields', blogPost.seoFields);
      console.log(`image: ${blogPost.seoFields?.shareImagesCollection?.items[0]?.url}`);
      return {
        locale,
        slug: blogPost.slug!,
      };
    });
}

interface BlogPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({
  params: { locale, slug },
}: BlogPageProps): Promise<Metadata> {
  const { isEnabled: preview } = draftMode();
  const gqlClient = preview ? previewClient : client;
  const { pageBlogPostCollection } = await gqlClient.pageBlogPost({ locale, slug, preview });
  const blogPost = pageBlogPostCollection?.items[0];

  if (!blogPost) {
    return {};
  }

  const ogImage = blogPost.seoFields?.shareImagesCollection?.items[0]?.url;
  const urlPath = locale === 'en-US' ? slug : `${locale}/${slug}`;

  return {
    title: blogPost.seoFields?.pageTitle,
    description: blogPost.seoFields?.pageDescription,
    openGraph: {
      title: blogPost.seoFields?.pageTitle || '',
      description: blogPost.seoFields?.pageDescription || '',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${urlPath}`,
      siteName: 'RebelFi Blog',
      type: 'article',
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function Page({ params: { locale, slug } }: BlogPageProps) {
  const { isEnabled: preview } = draftMode();
  const gqlClient = preview ? previewClient : client;
  const { t } = await initTranslations({ locale });
  const { pageBlogPostCollection } = await gqlClient.pageBlogPost({ locale, slug, preview });
  const { pageLandingCollection } = await gqlClient.pageLanding({ locale, preview });
  const landingPage = pageLandingCollection?.items[0];
  const blogPost = pageBlogPostCollection?.items[0];

  // Get latest 3 articles instead of related articles
  const { pageBlogPostCollection: latestPostsData } = await gqlClient.pageBlogPostCollection({
    locale,
    limit: 3,
    order: PageBlogPostOrder.PublishedDateDesc,
    where: {
      slug_not: slug, // Exclude current article
    },
    preview,
  });

  const latestPosts = latestPostsData?.items;
  const isFeatured = Boolean(
    blogPost?.slug && landingPage?.featuredBlogPost?.slug === blogPost.slug,
  );

  if (!blogPost) {
    notFound();
  }

  return (
    <div className="relative">
      {/* Article Hero */}
      <Container className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 md:mt-8 md:px-8 lg:mt-10">
        <ArticleHero article={blogPost} isFeatured={isFeatured} isReversedLayout={true} />
      </Container>

      {/* Article Content */}
      <Container className="mx-auto mt-8 max-w-5xl px-4 sm:px-6 md:mt-12 md:px-8 lg:mt-16">
        <div className="p-8 md:p-12">
          <ArticleContent article={blogPost} />
        </div>
      </Container>

      {/* Latest Articles Section */}
      {latestPosts && latestPosts.length > 0 && (
        <Container className="mx-auto my-16 max-w-7xl px-4 sm:px-6 md:my-20 md:px-8 lg:my-24">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Latest <span className="text-gradient">Articles</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Discover more insights and updates from the RebelFi ecosystem
            </p>
          </div>

          <ArticleTileGrid
            className="grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3"
            articles={latestPosts}
          />

          {/* View All Articles CTA */}
          <div className="mt-12 text-center">
            <a href="/" className="btn-secondary px-8 py-4 text-lg">
              View All Articles
            </a>
          </div>
        </Container>
      )}

      {/* Newsletter Signup CTA */}
      <div className="border-t border-gray-200 bg-gray-50">
        <Container className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:px-8">
          <NewsletterSignup />
        </Container>
      </div>
    </div>
  );
}
