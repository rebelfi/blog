import path from 'node:path';
import fs from 'node:fs';

import type { MetadataRoute } from 'next';

import { defaultLocale, locales } from '@src/i18n/config';
import type { SitemapPagesFieldsFragment } from '@src/lib/__generated/sdk';
import { client } from '@src/lib/client';

type SitemapFieldsWithoutTypename = Omit<SitemapPagesFieldsFragment, '__typename'>;
type SitemapPageCollection = SitemapFieldsWithoutTypename[keyof SitemapFieldsWithoutTypename];

// Revalidate sitemap every hour (3600 seconds) - use 0 for immediate updates during development
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get the last modified time of the faq-data.json file and load its contents
  const faqDataPath = path.join(process.cwd(), 'public', 'faq-data.json');
  let faqFileModified: Date | null = null;
  let faqData: Record<string, any> = {};

  try {
    const stats = fs.statSync(faqDataPath);
    faqFileModified = stats.mtime;

    // Load FAQ data to check which articles have FAQ entries
    const faqContent = fs.readFileSync(faqDataPath, 'utf-8');
    faqData = JSON.parse(faqContent);
  } catch (error) {
    console.warn('Could not read faq-data.json file:', error);
  }

  const promises =
    locales?.map(locale => client.sitemapPages({ locale })).filter(page => Boolean(page)) || [];
  const dataPerLocale: SitemapFieldsWithoutTypename[] = await Promise.all(promises);
  const fields = dataPerLocale
    .flatMap((localeData, index) =>
      Object.values(localeData).flatMap((pageCollection: SitemapPageCollection) =>
        pageCollection?.items.map(item => {
          const localeForUrl = locales?.[index] === defaultLocale ? undefined : locales?.[index];
          const url = new URL(
            path.join(localeForUrl || '', item?.slug || ''),
            process.env.NEXT_PUBLIC_BASE_URL!,
          ).toString();

          if (!item || item.seoFields?.excludeFromSitemap) {
            return undefined;
          }

          // Check if this article has FAQ data by looking for its slug in faq-data.json
          const hasFaqData = item.slug && faqData[item.slug];

          // Use FAQ file modification time if article has FAQ data, otherwise use CMS publishedAt
          const lastModified =
            hasFaqData && faqFileModified ? faqFileModified : item.sys.publishedAt;

          return {
            lastModified: lastModified,
            url,
          };
        }),
      ),
    )
    .filter(field => field !== undefined);

  return fields;
}
