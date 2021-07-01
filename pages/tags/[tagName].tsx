import {
  getPostsWithTag,
  getTagDisplayName,
  getTags,
  Post,
} from "../../components/posts";
import { GetStaticProps } from "next";
import { PostList } from "../../components/postListByYear";
import React from "react";
import Head from "next/head";
import Link from "next/link";

export async function getStaticPaths() {
  const tags = await getTags();
  const paths = await Promise.all(
    tags.map((tagName) => ({
      params: {
        tagName: tagName.toLowerCase(),
      },
    }))
  );
  return {
    paths: paths,
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  if (!context?.params) throw new Error("Missing parameters");

  const { tagName } = context.params;

  if (typeof tagName !== "string") throw new Error("tagName must be string");
  const tagDisplayName = await getTagDisplayName(tagName);

  return {
    props: {
      tagName: tagName,
      tagDisplayName: tagDisplayName,
      posts: await getPostsWithTag(tagDisplayName),
    },
  };
};

export const ListPostForTag: React.FC<{
  tagName: string;
  tagDisplayName: string;
  posts: Post[];
}> = ({ tagName, tagDisplayName, posts }) => {
  return (
    <main>
      <Head>
        <title>Tag: {tagDisplayName} - naisblog</title>
      </Head>
      <article>
        <header>
          <h1>Posts tagged with {tagDisplayName}</h1>
        </header>
        <PostList posts={posts} />
      </article>
    </main>
  );
};

export default ListPostForTag;
