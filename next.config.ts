import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The dev badge sits bottom-left, exactly over the navigation.
  devIndicators: false,
  // Next blocks dev assets/HMR for any host other than localhost: without this, opening the
  // "Network" URL (e.g. http://192.168.1.69:3000) renders the HTML but never hydrates.
  // Development only — production builds are unaffected.
  allowedDevOrigins: ['192.168.*.*', '10.**', '*.local'],
  // OG image routes read app/icon.png from disk: ship it with their serverless bundle
  // in case a route is ever regenerated at request time.
  outputFileTracingIncludes: { '/**/opengraph-image*': ['./app/icon.png'] },
  // Permanent redirects for URLs of the legacy PHP site, preserving existing links and ranking signals.
  async redirects() {
    return [
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/error', destination: '/', permanent: true },
      { source: '/projDev/:path*', destination: '/it/sistemi', permanent: true },
      { source: '/projProd/:path*', destination: '/it/sistemi', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
