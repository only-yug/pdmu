import type { NextConfig } from "next";

const nextConfig = async (): Promise<NextConfig> => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Use dynamic import and check for environment to avoid build-time crashes
      const { getPlatformProxy } = await import('wrangler');
      const proxy = await getPlatformProxy();
      const { env } = proxy;

      if (env.DB) {
        (globalThis as any).DB = env.DB;
        console.log('✅ [NextConfig] D1 Database connected (local)');
      }
    } catch (e) {
      console.warn('⚠️ [NextConfig] Cloudflare D1 proxy could not be initialized. Data might be mock/static.');
    }
  }

  return {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/leading',
          permanent: false,
        },
      ];
    },
    // Ensure wrangler and other cloudflare packages don't leak to client bundle
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
          child_process: false,
          net: false,
          tls: false,
        };
      }
      return config;
    },
  };
};

export default nextConfig;
