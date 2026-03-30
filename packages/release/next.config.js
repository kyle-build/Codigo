/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@codigo/materials-react'] = '@codigo/materials';
    return config;
  },
}

module.exports = nextConfig
