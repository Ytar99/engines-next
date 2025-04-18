/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/catalog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
