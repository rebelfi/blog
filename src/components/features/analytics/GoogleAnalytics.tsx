'use client';

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';

interface GoogleAnalyticsProps {
  gaId: string;
}

export const GoogleAnalytics = ({ gaId }: GoogleAnalyticsProps) => {
  return <NextGoogleAnalytics gaId={gaId} />;
};
