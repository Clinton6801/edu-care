import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow Daily.co iframes on the live session page
        source: '/live/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://*.daily.co;",
          },
        ],
      },
    ]
  },
}

export default nextConfig;
