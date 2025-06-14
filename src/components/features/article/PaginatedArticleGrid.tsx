'use client';

import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { useRouter, usePathname } from 'next/navigation';

import { ArticleTileGrid } from '@src/components/features/article/ArticleTileGrid';
import { Pagination } from '@src/components/shared/pagination';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface PaginatedArticleGridProps {
  articles: (PageBlogPostFieldsFragment | null)[];
  total: number;
  currentPage: number;
  className?: string;
}

export const PaginatedArticleGrid = ({
  articles,
  total,
  currentPage,
  className,
}: PaginatedArticleGridProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const POSTS_PER_PAGE = 6;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!articles.length) {
    return (
      <div className="py-16 text-center">
        <div className="card mx-auto max-w-md p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-rebel opacity-50">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">No Articles Found</h3>
          <p className="text-gray-600">Check back soon for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <ArticleTileGrid articles={articles} className={className} />

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
        </div>
      )}
    </div>
  );
};
