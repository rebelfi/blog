'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from '@contentful/live-preview/react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

import { ArticleLabel } from '@src/components/features/article/ArticleLabel';
import { CtfImage } from '@src/components/features/contentful';
import { FormatDate } from '@src/components/shared/format-date';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';
import { Container } from '@src/components/shared/container';

interface ArticleHeroProps {
  article: PageBlogPostFieldsFragment;
  isFeatured?: boolean;
  isReversedLayout?: boolean;
  locale?: string;
}

export const ArticleHero = ({
  article,
  isFeatured,
  isReversedLayout = false,
}: ArticleHeroProps) => {
  const { t } = useTranslation();
  const inspectorProps = useContentfulInspectorMode({ entryId: article.sys.id });
  const { title, shortDescription, publishedDate } = useContentfulLiveUpdates(article);

  return (
    <Link href={`/${article.slug}`}>
      <div className="relative cursor-pointer">
        <div
          className={twMerge(
            `group flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md`,
            isReversedLayout ? 'lg:flex-row-reverse' : 'lg:flex-row',
          )}
        >
          <div
            className="relative max-h-[350px] flex-1 basis-1/2 overflow-hidden md:max-h-[400px]"
            {...inspectorProps({ fieldId: 'featuredImage' })}
          >
            {article.featuredImage && (
              <CtfImage
                nextImageProps={{
                  className:
                    'w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500',
                  priority: true,
                  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
                }}
                {...article.featuredImage}
              />
            )}

            {/* Category Badge */}
            <div className="absolute left-4 top-4 z-20">
              <span className="inline-block rounded bg-rebel-purple-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                DeFi
              </span>
            </div>
          </div>

          <div className="flex flex-1 basis-1/2 flex-col justify-center px-6 py-6 sm:py-8 md:py-10 lg:px-12 lg:py-12 xl:px-16">
            <div className="mb-4 flex flex-wrap items-center justify-between">
              {isFeatured && (
                <ArticleLabel
                  className={twMerge(
                    'rounded bg-rebel-purple-600 px-4 py-2 text-sm font-medium text-white',
                    isReversedLayout ? 'lg:order-2' : '',
                  )}
                >
                  {t('article.featured')}
                </ArticleLabel>
              )}

              <div
                className={twMerge(
                  'flex items-center gap-2 text-sm text-gray-500',
                  isReversedLayout ? 'lg:order-1' : '',
                )}
                {...inspectorProps({ fieldId: 'publishedDate' })}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                  />
                </svg>
                {publishedDate && <FormatDate date={publishedDate} />}
              </div>
            </div>

            <h1
              className="mb-4 text-2xl font-bold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-rebel-purple-600 sm:text-3xl md:text-4xl lg:text-5xl"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {title}
            </h1>

            {shortDescription && (
              <p
                className="mb-6 text-lg leading-relaxed text-gray-600 sm:text-xl"
                {...inspectorProps({ fieldId: 'shortDescription' })}
              >
                {shortDescription}
              </p>
            )}

            <div className="flex items-center gap-4">
              <span className="btn-primary px-5 py-2.5 text-sm">Read Article</span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>5 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
