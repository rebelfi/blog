import { i18nRouter } from 'next-i18n-router';
import type { NextRequest } from 'next/server';

import i18nConfig from '@src/i18n/config';

export function middleware(request: NextRequest) {
  // Get the preferred locale from cookie or header
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const headerLocale = request.headers.get('accept-language')?.split(',')[0].split('-')[0];
  
  // If we're on the root path and have a Spanish preference, redirect to /es
  if (request.nextUrl.pathname === '/' && 
      ((cookieLocale && cookieLocale === 'es') || 
       (!cookieLocale && headerLocale === 'es'))) {
    return Response.redirect(new URL('/es', request.url));
  }

  return i18nRouter(request, i18nConfig);
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
