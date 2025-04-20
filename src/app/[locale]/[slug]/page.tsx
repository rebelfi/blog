import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { ArticleContent, ArticleHero, ArticleTileGrid } from '@src/components/features/article';
import { Container } from '@src/components/shared/container';
import initTranslations from '@src/i18n';
import { client, previewClient } from '@src/lib/client';
import { SeoFieldsFragment } from '@src/lib/__generated/sdk';

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
  const relatedPosts = blogPost?.relatedBlogPostsCollection?.items;
  const isFeatured = Boolean(
    blogPost?.slug && landingPage?.featuredBlogPost?.slug === blogPost.slug,
  );

  if (!blogPost) {
    notFound();
  }

  return (
    <>
      <Container className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 md:mt-8 md:px-8 lg:mt-10">
        <ArticleHero article={blogPost} isFeatured={isFeatured} isReversedLayout={true} />
      </Container>
      <Container className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 md:mt-8 md:px-8 lg:mt-10">
        <ArticleContent article={blogPost} />
      </Container>
      {relatedPosts && (
        <Container className="mx-auto my-8 max-w-7xl px-4 sm:px-6 md:my-10 md:px-8 lg:my-16">
          <h2 className="mb-4 text-xl md:mb-6 md:text-2xl lg:text-3xl">
            {t('article.relatedArticles')}
          </h2>
          <ArticleTileGrid
            className="grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
            articles={relatedPosts}
          />
        </Container>
      )}
    </>
  );
}
