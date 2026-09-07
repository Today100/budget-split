/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://budget-25294.firebaseapp.com/__/auth/:path*',
      },
      {
        source: '/__/firebase/:path*',
        destination: 'https://budget-25294.firebaseapp.com/__/firebase/:path*',
      }
    ];
  },
};

export default nextConfig;