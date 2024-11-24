'use client';

import { useTranslation } from 'react-i18next';

import { Container } from '@src/components/shared/container';

import BlogLogo from '@icons/blog-logo.svg';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t-color mt-10 border-t border-gray200">
      <Container className="py-8 mx-16">
        <BlogLogo className="w-24 h-8 mb-2" />
        <div className="max-w-4xl">{t('footer.description')}</div>
      </Container>
    </footer>
  );
};
