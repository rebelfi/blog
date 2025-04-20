'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from '@contentful/live-preview/react';
import Link from 'next/link';
import { HTMLProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { CtfImage } from '@src/components/features/contentful';
import { FormatDate } from '@src/components/shared/format-date';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface ArticleTileProps extends HTMLProps<HTMLDivElement> {
  article: PageBlogPostFieldsFragment;
}

export const ArticleTile = ({ article, className }: ArticleTileProps) => {
  const { featuredImage, publishedDate, slug, title } = useContentfulLiveUpdates(article);
  const inspectorProps = useContentfulInspectorMode({ entryId: article.sys.id });

  return (
    <Link className="flex h-full flex-col" href={`/${slug}`}>
      <div
        className={twMerge(
          'flex h-full flex-1 flex-col overflow-hidden rounded-2xl border border-gray300 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl',
          className,
        )}
      >
        {featuredImage && (
          <div
            className="h-48 overflow-hidden sm:h-40 md:h-48 lg:h-52"
            {...inspectorProps({ fieldId: 'featuredImage' })}
          >
            <CtfImage
              nextImageProps={{
                className: 'object-cover w-full h-full',
                sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
              }}
              {...featuredImage}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col py-3 px-3 sm:py-4 sm:px-4 md:py-4 md:px-5">
          {title && (
            <h3
              className="line-clamp-2 mb-2 text-sm font-semibold sm:text-base md:text-lg"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {title}
            </h3>
          )}

          <div className="mt-auto flex items-center">
            <div
              className="ml-auto text-xs text-gray600"
              {...inspectorProps({ fieldId: 'publishedDate' })}
            >
              {publishedDate && <FormatDate date={publishedDate} />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
