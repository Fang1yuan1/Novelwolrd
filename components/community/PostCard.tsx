"use client";

import { useRouter } from "next/navigation";
import { COPY } from "@/lib/community-copy";
import { formatWhen, type CommunityPost } from "@/lib/community";
import { Avatar, CmIcon, CommentIcon, RankBadge } from "./shared";

export default function PostCard({
  post,
  liked,
  showNovel,
  onLike,
}: {
  post: CommunityPost;
  liked: boolean;
  showNovel?: boolean;
  onLike: (p: CommunityPost) => void;
}) {
  const router = useRouter();
  const href = `/novel/${post.novel_id}/community/${post.id}`;
  return (
    <article
      className="cm-post"
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      style={{ cursor: "pointer" }}
    >
      <div className="cm-post-row">
        <Avatar src={post.author_avatar} />
        <div className="cm-post-main">
          <div className="cm-post-head">
            <span className="cm-name">{post.author_name}</span>
            <RankBadge points={post.author_points} />
            {post.author_title && <span className="cm-badge title">{post.author_title}</span>}
            {post.is_featured && <span className="cm-badge feat">{COPY.featured}</span>}
          </div>
          <div className="cm-body">
            {post.title && <b>{post.title}{"\n"}</b>}
            {post.body}
          </div>
          {showNovel && (
            <div className="cm-novel-line">
              {COPY.inNovel} «{post.novel_title}»
            </div>
          )}
          <div className="cm-foot">
            <span className="cm-foot-time">{formatWhen(post.created_at)}</span>
            <span className="cm-stat" aria-label="التعليقات">
              <CommentIcon />
              <span>{post.comments_count}</span>
            </span>
            <button
              type="button"
              className={`cm-stat${liked ? " is-liked" : ""}`}
              aria-label="إعجاب"
              onClick={(e) => {
                e.stopPropagation();
                onLike(post);
              }}
            >
              <CmIcon name="like" w={32} h={32} />
              <span>{post.likes_count}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
