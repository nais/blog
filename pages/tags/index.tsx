import { getTags } from "../../components/posts";
import { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import React from "react";

const TagButton: React.FC<{ tagName: string }> = ({ tagName }) => (
  <li>
    <Link href={`/tags/${tagName.toLowerCase()}`} passHref>
      <a>{tagName}</a>
    </Link>
  </li>
);

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      tags: await getTags(),
    },
  };
};

export const TagIndex: React.FC<{ tags: string[] }> = ({ tags }) => {
  return (
    <main>
      <Head>
        <title>Tags - nais blog</title>
      </Head>
      <article>
        {tags.map((t) => (
          <TagButton key={t} tagName={t} />
        ))}
      </article>
    </main>
  );
};

export default TagIndex;
