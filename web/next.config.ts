import type { NextConfig } from 'next';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

/** Directory containing `web/package.json` and `node_modules` (stable even if multiple lockfiles exist). */
const WEB_ROOT = path.dirname(require.resolve('./package.json'));

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
  },
  turbopack: {
    root: WEB_ROOT,
  },
};

export default nextConfig;
