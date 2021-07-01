import React from "react";
import { GetStaticProps } from "next";
import { InferGetStaticPropsType } from "next";
import { Post, getPosts } from "../components/posts";
import { PostList } from "../components/postListByYear";
import Link from "next/link";

export const getStaticProps: GetStaticProps = async (context) => {
  const posts: Post[] = await getPosts();

  return {
    props: {
      posts,
    },
  };
};

export const PostIndex = ({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <>
      <main>
        <article className={"welcomeMessage"}>
          <div>👋</div>
          <p className={"welcomeText"}>
            Welcome to the informal technical journal of the team behind{" "}
            <Link href={"https://nais.io/"}>
              <a>nais.io</a>
            </Link>
            .
          </p>
        </article>
        <PostList posts={posts} />
      </main>
    </>
  );
};

export default PostIndex;
