'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';

import { Container } from '@src/components/shared/container';

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/rebelfi_io',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@RebelFi',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'Medium',
    href: 'https://medium.com/@rebelfi',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z" />
      </svg>
    ),
  },
];

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-gray-200">
      <div className="bg-gray-50 py-16">
        <Container className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-center">
                <Image
                  src="https://rebelfi.nyc3.cdn.digitaloceanspaces.com/rebelfi/rebelfi_logo_long_purple.png"
                  alt="RebelFi"
                  width={140}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>

              <p className="mb-6 max-w-md text-lg leading-relaxed text-gray-600">
                {t('footer.description')}
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href="https://rebelfi.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Launch Platform
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-6 text-lg font-bold text-gray-900">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://rebelfi.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
                  >
                    Platform
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://docs.rebelfi.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="mb-6 text-lg font-bold text-gray-900">Community</h3>
              <ul className="space-y-4">
                {socialLinks.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-gray-600 transition-colors duration-200 hover:text-gray-900"
                    >
                      <div className="rounded-lg bg-gray-200 p-2 transition-colors duration-200 group-hover:bg-gray-300">
                        {link.icon}
                      </div>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 flex flex-col items-center justify-center border-t border-gray-200 pt-8 sm:flex-row">
            <p className="text-sm text-gray-500">© 2024 RebelFi. All rights reserved.</p>
          </div>
        </Container>
      </div>
    </footer>
  );
};
