'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

import { LanguageSelector } from '@src/components/features/language-selector';
import { Container } from '@src/components/shared/container';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="glass sticky top-0 z-50 border-b border-gray-200 py-3">
      <nav>
        <Container className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" title={t('common.homepage')} className="group flex items-center">
            <Image
              src="https://rebelfi.nyc3.cdn.digitaloceanspaces.com/rebelfi/rebelfi_logo_long_purple.png"
              alt="RebelFi"
              width={140}
              height={32}
              priority
              className="h-8 w-auto"
            />
            <span className="ml-3 text-lg font-medium text-gray-600">Blog</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open('https://rebelfi.io', '_blank', 'noopener,noreferrer')}
              className="btn-primary hidden items-center gap-2 px-4 py-2 text-sm sm:flex"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Launch Platform
            </button>

            <button
              onClick={() => window.open('https://rebelfi.io', '_blank', 'noopener,noreferrer')}
              className="btn-primary p-2 sm:hidden"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>

            <div className="rounded-lg border border-gray-200 bg-gray-100 p-1.5">
              <LanguageSelector />
            </div>
          </div>
        </Container>
      </nav>
    </header>
  );
};
