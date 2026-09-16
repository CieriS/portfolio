import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * `script-src` keeps 'unsafe-inline' on purpose. Every page here is prerendered (SSG), and a
 * nonce has to be minted per request in the middleware — that would turn the whole site
 * dynamic to protect three inline scripts we ship ourselves: the JSON-LD block, the
 * next-themes anti-flash script and Next's own bootstrap. Everything else is closed.
 * No font host is allowed because next/font self-hosts Geist and Instrument Serif at build.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
];

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
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
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
