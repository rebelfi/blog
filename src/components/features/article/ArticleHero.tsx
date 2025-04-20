'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from '@contentful/live-preview/react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

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
    <Container>
      <div
        className={twMerge(
          `flex flex-col overflow-hidden rounded-2xl border border-gray300 shadow-lg`,
          isReversedLayout ? 'lg:flex-row-reverse' : 'lg:flex-row',
        )}
      >
        <div
          className="max-h-[350px] flex-1 basis-1/2 overflow-hidden md:max-h-[400px]"
          {...inspectorProps({ fieldId: 'featuredImage' })}
        >
          {article.featuredImage && (
            <CtfImage
              nextImageProps={{
                className: 'w-full h-full object-cover',
                priority: true,
                sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
              }}
              {...article.featuredImage}
            />
          )}
        </div>

        <div className="relative flex flex-1 basis-1/2 flex-col justify-center py-4 px-4 sm:py-5 md:py-6 lg:px-12 lg:py-8 xl:px-16">
          <div className="mb-2 flex flex-wrap items-center">
            {isFeatured && (
              <ArticleLabel
                className={twMerge(
                  'ml-auto pl-2 lg:absolute lg:top-6 xl:top-8',
                  isReversedLayout ? 'lg:left-6 xl:left-8' : 'lg:right-6 xl:right-8',
                )}
              >
                {t('article.featured')}
              </ArticleLabel>
            )}
            <div
              className={twMerge(
                'ml-auto hidden pl-2 text-xs text-gray600',
                isReversedLayout ? 'lg:block' : '',
              )}
              {...inspectorProps({ fieldId: 'publishedDate' })}
            >
              {publishedDate && <FormatDate date={publishedDate} />}
            </div>
          </div>
          <h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl"
            {...inspectorProps({ fieldId: 'title' })}
          >
            {title}
          </h1>
          {shortDescription && (
            <p
              className="mt-2 text-base sm:text-lg"
              {...inspectorProps({ fieldId: 'shortDescription' })}
            >
              {shortDescription}
            </p>
          )}
          <div
            className={twMerge('mt-2 text-xs text-gray600', isReversedLayout ? 'lg:hidden' : '')}
            {...inspectorProps({ fieldId: 'publishedDate' })}
          >
            {publishedDate && <FormatDate date={publishedDate} />}
          </div>
        </div>
      </div>
    </Container>
  );
};
