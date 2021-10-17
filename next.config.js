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
            // The following two redirects are here because for a period of a few months,
            // the NextJS version of this blog was running with the incorrect assumption
            // that URLs were derived from markdown file names as opposed to the title.
            // So in case anyone has gotten the incorrect URL, we redirect them.
            {
               source: "/posts/2021/03/oauth3.html",
               destination: "/posts/2021/03/oauth-del-3-pkce.html",
               permanent: true,
            },
            {
               source: "/posts/2020/09/zero-trust.html",
               destination: "/posts/2020/09/zero-trust-networking-in-gcp.html",
               permanent: true,
            },
         ];
      return [];
   },
});
