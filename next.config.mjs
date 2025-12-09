

// @ts-check

import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    // Add other Next.js configurations here if needed
};

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === 'development',
    // You can add more PWA options here
});

export default withPWA(nextConfig);
