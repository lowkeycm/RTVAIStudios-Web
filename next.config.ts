import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // These production aliases aren't permitted Bunny playback referrers.
    // Keep bookmarks and shared paths working on the canonical studio domain.
    // Exact hosts leave local development and branch previews independent.
    return [
      'rtvai-studios-web.vercel.app',
      'rtvai-studios-web-pridefamilyrealty.vercel.app',
      'rtvai-studios-web-git-main-pridefamilyrealty.vercel.app',
    ].map(host => ({
      source: '/:path*',
      has: [{type: 'host' as const, value: host.replaceAll('.', '\\.')}],
      destination: 'https://www.rtvaistudios.com/:path*',
      permanent: false,
    }));
  },
};

export default nextConfig;
