import React from "react";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import {
  getPosts,
  getPost,
  parseMetadata,
  Post,
} from "../../../../components/posts";
import path from "path";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
/* Use `…/dist/cjs/…` if you’re not in ESM! */
import { materialOceanic } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ReactBaseProps } from "react-markdown/src/ast-to-react";
import Link from "next/link";
import Head from "next/head";

import uriTransformer from "react-markdown/src/uri-transformer";

const transformImageURI = (
  src: string,
  alt: string,
  title: string | null
): string => {
  return uriTransformer(src.replace(/blog/, "blog"));
};

const components = {
  code({ node, inline, className, children, ...props }: ReactBaseProps) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter style={materialOceanic} language={match[1]} {...props}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {String(children).replace(/\n$/, "")}
      </code>
    );
  },
};
const paramsForPost = async (
  post: Post
): Promise<{
  params: { year: string; month: string; slug: string; post: Post };
}> => {
  const metadata = parseMetadata(post.metadataJSON);
  const year = metadata.date.getFullYear().toString();
  const month = String(metadata.date.getMonth() + 1).padStart(2, "0");
  const baseName = path.basename(post.filePath, ".md");

  return { params: { year: year, month: month, slug: baseName, post: post } };
};

export async function getStaticPaths() {
  const posts = await getPosts();
  const paths = await Promise.all(posts.map((p) => paramsForPost(p)));
  return {
    paths: paths,
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  // I feel like I'm in infomercial B-roll... "There has got to be a better way!"
  if (
    typeof context?.params?.year === "string" &&
    typeof context?.params?.month === "string" &&
    typeof context?.params?.slug === "string"
  ) {
    try {
      const post: Post = await getPost(
        context.params.year,
        context.params.month,
        context.params.slug
      );
      return {
        props: {
          post: post,
        },
      };
    } catch (e) {
      throw e; // {message: "not found"}
    }
  }
  throw { message: "not found" };
  //console.log(context)
};

const TagButton: React.FC<{ name: string }> = ({ name }) => {
  return (
    <li>
      <Link href={`/tags/${name.toLowerCase()}`}>
        <a>{name}</a>
      </Link>
    </li>
  );
};

export const PostDetail = ({
  post,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const metadata = parseMetadata(post.metadataJSON);
  // TODO: Add more vertical space here
  return (
    <>
      <Head>
        <title>{metadata.title} - nais blog</title>
      </Head>
      <main>
        <article>
          <header>
            <h1 className={"postTitle"}>{metadata.title}</h1>
            <h2>{metadata.description}</h2>
            <div>
              Published{" "}
              <time dateTime={metadata.date.toISOString()}>
                {metadata.date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
              {" by "}
              {metadata.author}
              <div className={"tagList"}>
                <ul>
                  {metadata.tags.map((tag) => (
                    <TagButton key={tag} name={tag} />
                  ))}
                </ul>
              </div>
            </div>
          </header>
          <div className={"content"}>
            {metadata.draft && (
              <p className={"draftIcon"}>
                THIS IS MARKED AS A DRAFT AND WILL NOT BE VISIBLE
              </p>
            )}
            <ReactMarkdown
              components={components}
              transformImageUri={transformImageURI}
              remarkPlugins={[gfm]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </>
  );
};

export default PostDetail;
