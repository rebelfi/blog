'use client';

import Link from 'next/link';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from '@contentful/live-preview/react';

import { ArticleLabel } from '@src/components/features/article/ArticleLabel';
import { CtfImage } from '@src/components/features/contentful';
import { FormatDate } from '@src/components/shared/format-date';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';
import { useTranslation } from 'react-i18next';

export interface ArticleTileProps {
  article: PageBlogPostFieldsFragment;
  size?: 'small' | 'medium' | 'large';
}

export const ArticleTile = ({ article, size = 'medium' }: ArticleTileProps) => {
  const { t } = useTranslation();
  const inspectorProps = useContentfulInspectorMode({ entryId: article.sys.id });
  const { title, shortDescription, publishedDate } = useContentfulLiveUpdates(article);

  return (
    <Link href={`/${article.slug}`}>
      <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          {article.featuredImage && (
            <div
              className="aspect-video w-full overflow-hidden"
              {...inspectorProps({ fieldId: 'featuredImage' })}
            >
              <CtfImage
                nextImageProps={{
                  className:
                    'w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300',
                  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
                }}
                {...article.featuredImage}
              />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute left-3 top-3 z-20">
            <span className="inline-block rounded bg-rebel-purple-600 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              DeFi
            </span>
          </div>

          {/* Reading Time */}
          <div className="absolute right-3 top-3 z-20">
            <div className="flex items-center gap-1 rounded bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>5 min</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-5">
          {/* Date */}
          <div
            className="mb-2 flex items-center gap-2 text-sm text-gray-500"
            {...inspectorProps({ fieldId: 'publishedDate' })}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
              />
            </svg>
            {publishedDate && <FormatDate date={publishedDate} />}
          </div>

          {/* Title */}
          <h3
            className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-rebel-purple-600"
            {...inspectorProps({ fieldId: 'title' })}
          >
            {title}
          </h3>

          {/* Description */}
          {shortDescription && (
            <p
              className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600"
              {...inspectorProps({ fieldId: 'shortDescription' })}
            >
              {shortDescription}
            </p>
          )}

          {/* Read More Link */}
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm font-semibold text-rebel-purple-600 group-hover:text-rebel-purple-700">
              Read Article
            </span>

            {/* Arrow Icon */}
            <div className="text-rebel-purple-600 transition-transform duration-200 group-hover:translate-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
