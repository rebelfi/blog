import Link from 'next/link';
import { Trans } from 'react-i18next/TransWithoutContext';

import { Container } from '@src/components/shared/container';
import initTranslations from '@src/i18n';
import { defaultLocale } from '@src/i18n/config';

export default async function NotFound() {
  const locale = defaultLocale;
  const { t } = await initTranslations({ locale });

  return (
    <Container>
      <h1 className="h2">{t('notFound.title')}</h1>
      <p className="mt-4">
        <Trans i18nKey="notFound.description" t={t}>
          <Link className="text-blue500" href="/" />
        </Trans>
      </p>
    </Container>
  );
}
