const basePath = "/blog";
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase, { defaultConfig }) => ({
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
  basePath: basePath,
  env: {
    basePath: basePath,
  },
  TrailingSlash: true,
  async redirects() {
    // Give a nice redirect to the base path so we don't hit a 404 on /
    // when opening up http://localhost:3000/
    if (phase === PHASE_DEVELOPMENT_SERVER)
      return [
        {
          source: "/",
          destination: basePath,
          permanent: true,
          basePath: false,
        },
      ];
    return [];
  },
});
