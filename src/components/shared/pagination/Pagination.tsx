'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@contentful/f36-icons';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  className?: string;
  siblingCount?: number;
}

export const Pagination = ({
  currentPage,
  totalPages,
  basePath,
  className = '',
  siblingCount = 1,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(totalPages, currentPage + siblingCount);

    // Add first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add range around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const getPageUrl = (page: number) => {
    if (page === 1) {
      return basePath;
    }
    return `${basePath}?page=${page}`;
  };

  return (
    <nav aria-label="Pagination" className={twMerge('flex items-center justify-center', className)}>
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="rounded-lg border border-gray-300 p-2 transition-colors duration-200 hover:bg-gray-50"
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
        ) : (
          <div className="cursor-not-allowed rounded-lg border border-gray-200 p-2 opacity-50">
            <ChevronLeftIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return (
                <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                  ⋯
                </span>
              );
            }

            const pageNum = Number(pageNumber);
            const isCurrentPage = pageNum === currentPage;

            if (isCurrentPage) {
              return (
                <div
                  key={pageNumber}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                  aria-current="page"
                >
                  {pageNumber}
                </div>
              );
            }

            return (
              <Link
                key={pageNumber}
                href={getPageUrl(pageNum)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                aria-label={`Go to page ${pageNumber}`}
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="rounded-lg border border-gray-300 p-2 transition-colors duration-200 hover:bg-gray-50"
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </Link>
        ) : (
          <div className="cursor-not-allowed rounded-lg border border-gray-200 p-2 opacity-50">
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
    </nav>
  );
};
