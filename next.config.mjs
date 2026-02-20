/** @type {import('next').NextConfig} */

const nextConfig = async () => {
    if (process.env.NODE_ENV === 'development') {
        try {
            // Use dynamic import and check for environment to avoid build-time crashes
            const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
            await setupDevPlatform({ persist: true });

            // setupDevPlatform automatically assigns env bindings to process.env
            // we will map DB back to globalThis so db/index.ts can find it
            if (process.env.DB) {
                globalThis.DB = process.env.DB;
                console.log('✅ [NextConfig] D1 Database connected via setupDevPlatform (local)');
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
                    stream: false,
                    crypto: false,
                };
            }
            if (isServer) {
                // Ignore specific Node.js modules on the Edge runtime
                config.resolve.fallback = {
                    ...config.resolve.fallback,
                    stream: false,
                    crypto: false,
                };
            }
            return config;
        },
    };
};

export default nextConfig;
