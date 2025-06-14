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

interface ArticleTileProps {
  article: PageBlogPostFieldsFragment;
  size?: 'small' | 'medium' | 'large';
}

export const ArticleTile = ({ article, size = 'medium' }: ArticleTileProps) => {
  const { t } = useTranslation();
  const inspectorProps = useContentfulInspectorMode({ entryId: article.sys.id });
  const { title, shortDescription, publishedDate } = useContentfulLiveUpdates(article);

  return (
    <Link href={`/${article.slug}`}>
      <article className="card group flex h-full cursor-pointer flex-col transition-shadow duration-200 hover:shadow-lg">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {article.featuredImage && (
            <div
              className="aspect-video w-full overflow-hidden"
              {...inspectorProps({ fieldId: 'featuredImage' })}
            >
              <CtfImage
                nextImageProps={{
                  className:
                    'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
                  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
                }}
                {...article.featuredImage}
              />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-20">
            <div className="rounded-full border border-gray-200 bg-white/90 px-3 py-1 backdrop-blur-sm">
              <span className="text-xs font-medium text-gray-900">DeFi</span>
            </div>
          </div>

          {/* Reading Time */}
          <div className="absolute top-4 right-4 z-20">
            <div className="rounded-full border border-gray-200 bg-white/90 px-3 py-1 backdrop-blur-sm">
              <div className="flex items-center gap-1 text-xs text-gray-900">
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
        </div>

        {/* Content Section */}
        <div className="relative flex flex-1 flex-col p-6">
          {/* Background Gradient */}
          <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-br from-white/5 to-transparent"></div>

          <div className="relative z-10 flex flex-1 flex-col">
            {/* Date */}
            <div
              className="mb-3 flex items-center gap-2 text-sm text-gray-500"
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

            {/* Title */}
            <h3
              className="group-hover:text-gradient line-clamp-2 mb-3 text-xl font-bold leading-tight text-gray-900 transition-all duration-300"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {title}
            </h3>

            {/* Description */}
            {shortDescription && (
              <p
                className="line-clamp-3 mb-4 flex-1 leading-relaxed text-gray-600"
                {...inspectorProps({ fieldId: 'shortDescription' })}
              >
                {shortDescription}
              </p>
            )}

            {/* Read More Link */}
            <div className="mt-auto flex items-center justify-between">
              <span className="btn-primary px-4 py-2 text-sm">Read More</span>

              {/* Arrow Icon */}
              <div className="text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-rebel-purple-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Decorative Elements */}
          <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-gradient-rebel opacity-10 blur-xl"></div>
        </div>
      </article>
    </Link>
  );
};
