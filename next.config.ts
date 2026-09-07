/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Intercepts auth traffic on your Vercel domain
        source: '/__/auth/:path*',
        // Proxies it to your actual Firebase project
        destination: 'https://budget-25294.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig; // Use module.exports = nextConfig; if using .js instead of .mjs