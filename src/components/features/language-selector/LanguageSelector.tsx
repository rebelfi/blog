'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSelectorDesktop } from '@src/components/features/language-selector/LanguageSelectorDesktop';
import { LanguageSelectorMobile } from '@src/components/features/language-selector/LanguageSelectorMobile';
import i18nConfig, { locales } from '@src/i18n/config';

const localeName = locale => locale.split('-')[0];

const displayName = locale =>
  new Intl.DisplayNames([locale], {
    type: 'language',
  });

const isChangeEvent = (event: SyntheticEvent): event is React.ChangeEvent<HTMLSelectElement> => {
  return event.type === 'change';
};

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const handleLocaleChange: React.EventHandler<React.SyntheticEvent> = e => {
    let newLocale: string | undefined = undefined;

    if (isChangeEvent(e)) {
      newLocale = e.target.value;
    } else {
      const target = e.target as HTMLElement;
      newLocale = target.getAttribute('data-locale') as string;
    }

    if (!newLocale) {
      return;
    }

    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;

    // redirect to the new locale path
    let newPath = currentPathname;
    
    if (currentLocale === 'es') {
      // If we're on Spanish and going to English, remove /es
      newPath = currentPathname === '/es' ? '/' : currentPathname.replace('/es', '');
    } else {
      // If we're on English and going to Spanish, add /es
      newPath = '/es' + (currentPathname === '/' ? '' : currentPathname);
    }

    console.log('Redirecting to:', newPath);
    
    router.push(newPath);
    router.refresh();
  };

  return locales && locales.length > 1 ? (
    <>
      <div className="hidden md:block">
        <LanguageSelectorDesktop
          displayName={displayName}
          onChange={handleLocaleChange}
          localeName={localeName}
        />
      </div>

      <div className="block md:hidden">
        <LanguageSelectorMobile
          displayName={displayName}
          onChange={handleLocaleChange}
          localeName={localeName}
        />
      </div>
    </>
  ) : null;
};
