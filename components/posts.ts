import dirTree from "directory-tree";
import matter from "gray-matter";
import fs from "fs";
import * as z from "zod";
import path from "path";

export const PostMetadataSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    draft: z.boolean(),
    author: z.string(),
    tags: z.string().array(),
    filePath: z.string(),
  })
  .nonstrict();

export type PostMetadata = z.infer<typeof PostMetadataSchema>;

export type Post = {
  filePath: string;
  content: string; // content, in HTML string form
  metadataJSON: string; // metadata, in JSON string form
  mtime: number; // modification time in milliseconds since epoch
};

type PostFileWithMtime = {
  filename: string;
  mtime: number;
};

const filesInPostDirectory = (): PostFileWithMtime[] => {
  const POST_DIRECTORY = "./content/posts";
  let postFiles: { filename: string; mtime: number }[] = [];

  const postDirectories = dirTree(POST_DIRECTORY)?.children;

  if (!postDirectories)
    throw new Error(`Post directory "${POST_DIRECTORY}" not found!`);
  if (!postDirectories.length)
    throw new Error(`No blog posts found in "${POST_DIRECTORY}"!`);

  dirTree(POST_DIRECTORY, { extensions: /\.md$/ }, (item, path, stats) => {
    postFiles.push({ filename: path, mtime: stats.mtimeMs });
  });

  return postFiles;
};

export const loadPost = async (fileSpec: string): Promise<Post> => {
  const fileContents = fs.readFileSync(fileSpec, "utf8");
  const fileMtimeMS = fs.statSync(fileSpec).mtimeMs;
  const { data, content } = matter(fileContents);

  return {
    filePath: fileSpec,
    content: content,
    metadataJSON: JSON.stringify({ ...data, filePath: fileSpec }),
    mtime: fileMtimeMS,
  };
};

const loadCache = (filename: string): Post[] =>
  JSON.parse(fs.readFileSync(filename, "utf-8"));

const writePostsToCache = (filename: string, posts: Post[]) =>
  fs.writeFileSync(filename, JSON.stringify(posts));

const readPostsFromFiles = async (filenames: string[]): Promise<Post[]> => {
  return await Promise.all(filenames.map(async (x) => await loadPost(x)));
};

const refreshCache = async (
  files: PostFileWithMtime[],
  cacheFilename: string
): Promise<Post[]> => {
  let posts: Post[] = [];
  let cacheDirty: boolean = false;
  let cache = loadCache(cacheFilename);

  for (const f of files) {
    const cachedPost = cache.find((e) => e.filePath == f.filename);

    if (!cachedPost || cachedPost.mtime != f.mtime) {
      posts.push(await loadPost(f.filename));
      cacheDirty = true;
    } else {
      posts.push(cachedPost);
    }
  }

  //if (cacheDirty) writePostsToCache(cacheFilename, cache);
  return posts;
};

export const getAllPosts = async (): Promise<Post[]> => {
  const cacheFilename = "pageCache.json";
  const files = await filesInPostDirectory();

  try {
    return await refreshCache(files, cacheFilename);
  } catch (e) {
    const posts = await readPostsFromFiles(files.map((x) => x.filename));
    writePostsToCache(cacheFilename, posts);
    return posts;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  if (process.env.NODE_ENV == "development") return await getAllPosts();
  return (await getAllPosts()).filter((p) => !JSON.parse(p.metadataJSON).draft);
};

// For a given year, month and slug, return the first post found with
// the given slug. WARNING: This means that we require slugs to have
// unique titles.
export const getPost = async (
  year: string,
  month: string,
  slug: string
): Promise<Post> => {
  return loadPost(`./content/posts/${slug}/${slug}.md`);
};

// This rather silly function exists because NextJS does not know how to
// serialize dates in JSON, so we have to explicitly do that job ourselves.
export const parseMetadata = (metadataJSON: string): PostMetadata => {
  const metadataObject = JSON.parse(metadataJSON);
  return PostMetadataSchema.parse({
    ...metadataObject,
    date: new Date(metadataObject.date),
  });
};

// Iterates over all posts and returns a list of all tags used.
export const getTags = async (): Promise<string[]> => {
  let tags: string[] = [];
  const posts = await getPosts();

  posts.forEach((p) => {
    const postTags = JSON.parse(p.metadataJSON).tags;
    postTags.forEach((tag: string) => tags.includes(tag) || tags.push(tag));
  });

  return tags;
};

// Returns a list of posts with a given tag.
export const getPostsWithTag = async (tagName: string): Promise<Post[]> => {
  const allPosts = await getPosts();
  let postsWithTag: Post[] = [];

  allPosts.forEach((p) => {
    const postTags = JSON.parse(p.metadataJSON).tags;
    if (postTags.includes(tagName)) postsWithTag.push(p);
  });

  return postsWithTag;
};

// This rather silly function is here to preserve URI compatibility with
// v1 of this blog, which exported URIs for tags in lower-case, while the
// tags themselves were case-sensitive. So this just exists so we can
// get the internally used, case-sensitive tag name, from the externally
// presented lower-cased used in URLs etc.
export const getTagDisplayName = async (
  lowerCaseTagName: string
): Promise<string> => {
  for (const t of await getTags()) {
    if (lowerCaseTagName == t.toLowerCase()) return t;
  }

  throw new Error("No display name found for tag!");
};

// Convenience function to get the three components necessary to construct
// an absolute URL, given a post and its parsed metadata.
export const getAbsoluteURLComponents = (
  metadata: PostMetadata
): { year: string; month: string; slug: string } => {
  const year = String(metadata.date.getFullYear());
  const month = String(metadata.date.getMonth() + 1).padStart(2, "0");
  const slug = path.basename(metadata.filePath, ".md");

  return { year, month, slug };
};
