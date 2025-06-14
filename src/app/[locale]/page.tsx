import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { ArticleHero } from '@src/components/features/article';
import { PaginatedArticleGrid } from '@src/components/features/article/PaginatedArticleGrid';
import { Container } from '@src/components/shared/container';
import TranslationsProvider from '@src/components/shared/i18n/TranslationProvider';
import initTranslations from '@src/i18n';
import { locales } from '@src/i18n/config';
import { PageBlogPostOrder } from '@src/lib/__generated/sdk';
import { client, previewClient } from '@src/lib/client';

const POSTS_PER_PAGE = 6;

interface LandingPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { isEnabled: preview } = draftMode();
  const gqlClient = preview ? previewClient : client;
  const landingPageData = await gqlClient.pageLanding({ locale: params.locale, preview });
  const page = landingPageData.pageLandingCollection?.items[0];
  const languages = locales.length > 1 ? {} : undefined;

  if (languages) {
    for (const locale of locales) {
      languages[locale] = `/${locale}`;
    }
  }

  let metadata: Metadata = {
    alternates: {
      canonical: '/',
      languages,
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

export default async function Page({ params: { locale }, searchParams }: LandingPageProps) {
  const { isEnabled: preview } = draftMode();
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
      <Container className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 md:mt-8 md:px-8 lg:mt-10">
        <ArticleHero article={page.featuredBlogPost} />
      </Container>

      {/* Tutorial: contentful-and-the-starter-template.md */}
      {/* Uncomment the line below to make the Greeting field available to render */}
      {/*<Container>*/}
      {/*  <div className="my-5 bg-colorTextLightest p-5 text-colorBlueLightest">{page.greeting}</div>*/}
      {/*</Container>*/}

      <Container className="mx-auto my-8 max-w-7xl px-4 sm:px-6 md:my-10 md:px-8 lg:my-16">
        <PaginatedArticleGrid
          articles={posts}
          total={total}
          currentPage={currentPage}
          className="grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
        />
      </Container>
    </TranslationsProvider>
  );
}
