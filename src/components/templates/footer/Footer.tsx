'use client';

import { useTranslation } from 'react-i18next';

import { Container } from '@src/components/shared/container';

import BlogLogo from '@icons/blog-logo.svg';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t-color mt-10 border-t border-gray200">
      <Container className="py-6 md:py-8">
        <BlogLogo className="mb-2 h-8 w-24" />
        <div className="max-w-full break-words text-left text-sm md:text-base">
          {t('footer.description')}
        </div>
      </Container>
    </footer>
  );
};
