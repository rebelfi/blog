import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // No locale routing needed - just pass through all requests
  return;
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
