import '@src/app/globals.css';

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export const metadata = {
  title: 'Blog',
  description: 'A responsive blog website',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
};

export default async function RootLayout({ children }: LayoutProps) {
  return children;
}
