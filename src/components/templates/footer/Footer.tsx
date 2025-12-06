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
];

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-gray-200">
      <div className="bg-white py-16">
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

              <p className="mb-6 max-w-md text-base leading-relaxed text-gray-600">
                {t('footer.description')}
              </p>

              <div className="flex items-center gap-3">
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
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-gray-600 transition-colors duration-150 hover:text-rebel-purple-600"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://rebelfi.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors duration-150 hover:text-rebel-purple-600"
                  >
                    Platform
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://docs.rebelfi.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors duration-150 hover:text-rebel-purple-600"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">
                Community
              </h3>
              <ul className="space-y-3">
                {socialLinks.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-gray-600 transition-colors duration-150 hover:text-rebel-purple-600"
                    >
                      <div className="rounded border border-gray-200 bg-gray-50 p-2 transition-colors duration-150 group-hover:border-rebel-purple-200 group-hover:bg-rebel-purple-50">
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
