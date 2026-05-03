import type { DefaultSeoProps } from 'next-seo/pages';

const config: DefaultSeoProps = {
  titleTemplate: '%s | Nauvaraha',
  defaultTitle: 'Nauvaraha — Align Your Energy. Attract Your Abundance.',
  description:
    'Shop authentic pyrite frames, crystals, and vastu items. Curated for abundance, prosperity, and positive energy in your home and office.',
  canonical: 'https://nauvaraha.com',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://nauvaraha.com',
    siteName: 'Nauvaraha',
    images: [
      {
        url: 'https://nauvaraha.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nauvaraha — Align Your Energy',
      },
    ],
  },
  twitter: {
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
  ],
};

export default config;
