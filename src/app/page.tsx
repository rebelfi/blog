import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { ArticleHero } from '@src/components/features/article';
import { PaginatedArticleGrid } from '@src/components/features/article/PaginatedArticleGrid';
import { Container } from '@src/components/shared/container';
import { CtaButton } from '@src/components/shared/cta-button';
import TranslationsProvider from '@src/components/shared/i18n/TranslationProvider';
import initTranslations from '@src/i18n';
import { defaultLocale } from '@src/i18n/config';
import { PageBlogPostOrder } from '@src/lib/__generated/sdk';
import { client, previewClient } from '@src/lib/client';

const POSTS_PER_PAGE = 6;

interface LandingPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: preview } = draftMode();
  const gqlClient = preview ? previewClient : client;
  const landingPageData = await gqlClient.pageLanding({ locale: defaultLocale, preview });
  const page = landingPageData.pageLandingCollection?.items[0];

  let metadata: Metadata = {
    alternates: {
      canonical: '/',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };

  if (page?.seoFields) {
    metadata = {
      title: page.seoFields.pageTitle,
      description: page.seoFields.pageDescription,
      robots: {
        follow: !page.seoFields.nofollow,
        index: !page.seoFields.noindex,
      },
    };
  }

  return metadata;
}

export default async function Page({ searchParams }: LandingPageProps) {
  const { isEnabled: preview } = draftMode();
  const locale = defaultLocale;
  const { t, resources } = await initTranslations({ locale });
  const gqlClient = preview ? previewClient : client;

  const landingPageData = await gqlClient.pageLanding({ locale, preview });
  const page = landingPageData.pageLandingCollection?.items[0];

  if (!page) {
    notFound();
  }

  const currentPage = Number(searchParams?.page || '1');
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  const blogPostsData = await gqlClient.pageBlogPostCollection({
    limit: POSTS_PER_PAGE,
    skip: skip,
    locale,
    order: PageBlogPostOrder.PublishedDateDesc,
    where: {
      slug_not: page?.featuredBlogPost?.slug,
    },
    preview,
  } as any);

  const posts = blogPostsData.pageBlogPostCollection?.items;
  const total = (blogPostsData as any).pageBlogPostCollection?.total || 0;

  if (!page?.featuredBlogPost || !posts) {
    return;
  }

  return (
    <TranslationsProvider locale={locale} resources={resources}>
      <Container className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Article */}
        {page.featuredBlogPost && (
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-gradient-rebel"></div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Article</h2>
            </div>
            <ArticleHero article={page.featuredBlogPost} />
          </div>
        )}

        {/* Latest Articles Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Latest <span className="text-gradient">Articles</span>
            </h2>
            <p className="text-lg text-gray-600">
              Stay updated with the latest developments in DeFi, blockchain technology, and RebelFi
              platform updates.
            </p>
          </div>

          <PaginatedArticleGrid
            articles={posts}
            total={total}
            currentPage={currentPage}
            className="grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3"
          />
        </div>
      </Container>
    </TranslationsProvider>
  );
}
