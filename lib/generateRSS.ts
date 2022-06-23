import { writeFileSync } from "fs";
import { getAllPosts } from "../components/posts";
import RSS from "rss";
export default async function getRSS() {
  const siteURL = "https://nais.io/blog";
  const allBlogs = await getAllPosts();

  const feed = new RSS({
    title: "nais.io",
    description: "NAV's Application Infrastructure Service",
    site_url: siteURL,
    feed_url: `${siteURL}/feed.xml`,
    language: "en",
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}, the nais team`,
  });

  allBlogs.map((post) => {
   const metadata = JSON.parse(post.metadataJSON)
    feed.item({
      title: metadata.title,
      url: `${post.filePath}`,
      date: metadata.date,
      description: metadata.description,
    });
  });

  writeFileSync("./public/index.xml", feed.xml({ indent: true }));
}

