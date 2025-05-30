import { dir } from 'i18next';
import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import { draftMode } from 'next/headers';

import { ContentfulPreviewProvider } from '@src/components/features/contentful';
import TranslationsProvider from '@src/components/shared/i18n/TranslationProvider';
import { Footer } from '@src/components/templates/footer';
import { Header } from '@src/components/templates/header';
import initTranslations from '@src/i18n';
import { locales } from '@src/i18n/config';
import { GoogleAnalytics } from '@src/components/features/analytics/GoogleAnalytics';

export async function generateMetadata() {
  const metatadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
  } as Metadata;

  return metatadata;
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export async function generateStaticParams(): Promise<LayoutProps['params'][]> {
  return locales.map(locale => ({ locale }));
}

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

const allowedOriginList = ['https://app.contentful.com', 'https://app.eu.contentful.com'];

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function PageLayout({ children, params }: LayoutProps) {
  const { isEnabled: preview } = draftMode();
  const { locale } = params;
  const { resources } = await initTranslations({ locale });

  return (
    <html lang={locale} dir={dir(locale)}>
      <head>
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#5bbad5" />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </head>

      <body>
        <TranslationsProvider locale={locale} resources={resources}>
          <ContentfulPreviewProvider
            locale={locale}
            enableInspectorMode={preview}
            enableLiveUpdates={preview}
            targetOrigin={allowedOriginList}
          >
            <main className={`${roboto.variable} font-sans`}>
              <Header />
              {children}
              <Footer />
            </main>
            <div id="portal" className={`${roboto.variable} font-sans`} />
          </ContentfulPreviewProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
