console.log("hi");

import { Post } from "../components/posts";

const fs = require("fs");
const path = require("path");

const {
  getAbsoluteURLComponents,
  getPosts,
  getTags,
  parseMetadata,
} = require("../components/posts");

const urlEntry = (location: string, lastmod: Date) => {
  return `
              <url>
                <loc>${location}</loc>
                <lastmod>${lastmod.toISOString()}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>1.0</priority>
              </url>
            `;
};

const urlForPost = (metadataJSON: string, baseUrl: string) => {
  const m = parseMetadata(metadataJSON);
  const { year, month, slug } = getAbsoluteURLComponents(m);
  const location = `${baseUrl}/posts/${year}/${month}/${slug}`;
  return urlEntry(location, m.date);
};

const makeSitemap = async () => {
  // FIXME: Not sure how to do this transparently
  const baseUrl = `https://nais.io/blog-rewrite`;

  const staticPages = fs
    .readdirSync("pages")
    .filter((staticPage: string) => {
      return ![
        ".DS_Store", // ¯\_(ツ)_/¯
        "_app.js",
        "_document.js",
        "_error.js",
        "sitemap.xml.tsx",
        "404.tsx",
        "index.tsx",
        "posts",
      ].includes(staticPage);
    })
    .map((staticPagePath: string) => {
      return `${baseUrl}/${path.parse(staticPagePath).name}`;
    });
  staticPages.push(`${baseUrl}/`);
  console.log(staticPages);

  const posts = await getPosts();
  const tags = await getTags();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <?xml-stylesheet type="text/xsl" href="${baseUrl}/sitemap.xsl"?>

    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages.map((url: string) => urlEntry(url, new Date())).join("")}
      ${posts
        .map(({ metadataJSON }: Post) => urlForPost(metadataJSON, baseUrl))
        .join("")}
      ${tags
        .map((tag: string) =>
          urlEntry(`${baseUrl}/tags/${tag.toLowerCase()}`, new Date())
        )
        .join("")}
    </urlset>
  `;

  // GitHub pages wants to strip file extensions from requests, so
  // we add extra XML so clients can reach it at "/sitemap.xml".
  fs.writeFileSync("docs/sitemap.xml.xml", sitemap);
};

(async () => {
  try {
    var text = await makeSitemap();
  } catch (e) {
    console.log(e);
    // Deal with the fact the chain failed
  }
})();
