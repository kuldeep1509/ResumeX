const nextConfig = {
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'crypto': false,
        '@clerk/shared/devBrowser': false,
      };
    }
    return config;
  },
};

export default nextConfig;
