import { writeFileSync } from "fs";
import { Post } from "../components/posts";
import RSS from "rss";

const { getAbsoluteURLComponents } = require("../components/posts");

export default async function makeRSS(posts: Post[]) {
  const siteURL = "https://nais.io/blog";

  const feed = new RSS({
    title: "nais.io",
    description: "NAV's Application Infrastructure Service",
    site_url: siteURL,
    feed_url: `${siteURL}/feed.xml`,
    language: "en",
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}, the nais team`,
  });

  posts.map((post) => {
   const metadata = JSON.parse(post.metadataJSON);
   metadata.date = new Date(metadata.date)
    feed.item({
      title: metadata.title,
      url: urlForPost(metadata, siteURL),
      date: metadata.date,
      description: metadata.description,
    });
  });

  writeFileSync("./public/index.xml", feed.xml({ indent: true }));
}

const urlForPost = (metadata: Post, baseUrl: string) => {
   const { year, month, slug } = getAbsoluteURLComponents(metadata);
   return `${baseUrl}/posts/${year}/${month}/${slug}`;
 };

