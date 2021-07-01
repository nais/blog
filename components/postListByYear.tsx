import {
  parseMetadata,
  Post,
  PostMetadata,
  getAbsoluteURLComponents,
} from "./posts";
import React from "react";
import Link from "next/link";

const DraftIcon = () => <span className={"draftIcon"}>DRAFT</span>;

export const PostList: React.FC<{ posts: Post[] }> = ({ posts }) => {
  let postsAndMeta: {
    post: Post;
    metadata: PostMetadata;
  }[] = [];

  posts.forEach((p) =>
    postsAndMeta.push({ post: p, metadata: parseMetadata(p.metadataJSON) })
  );

  return (
    <div className={"postListByYear"}>
      <ol>
        {postsAndMeta
          .sort((a, b) => {
            if (a.metadata.date > b.metadata.date) {
              return -1;
            }
            if (a.metadata.date < b.metadata.date) {
              return 1;
            }
            return 0;
          })
          .map(({ post, metadata }, index) => {
            const { year, month, slug } = getAbsoluteURLComponents(metadata);
            const dateString = metadata.date.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            });
            return (
              <li key={index}>
                <time>
                  {dateString} {year}
                </time>
                <div>
                  {metadata.draft && <DraftIcon />}
                  <Link href={`/posts/${year}/${month}/${slug}`} passHref>
                    <a>{metadata.title}</a>
                  </Link>
                  <p>{metadata.description}</p>
                </div>
              </li>
            );
          })}
      </ol>
    </div>
  );
};
