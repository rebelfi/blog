'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

import { LanguageSelector } from '@src/components/features/language-selector';
import { Container } from '@src/components/shared/container';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="py-5">
      <nav>
        <Container className="flex items-center justify-between mx-16">
          <Link href="/" title={t('common.homepage')}>
            <Image 
              src="/assets/svg/blog-logo.svg"
              alt="Blog Logo"
              width={164}
              height={40}
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open('https://rebelfi.io', '_blank', 'noopener,noreferrer')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Open RebelFi
            </button>
            <LanguageSelector />
          </div>
        </Container>
      </nav>
    </header>
  );
};
