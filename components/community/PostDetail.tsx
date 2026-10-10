"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COPY } from "@/lib/community-copy";
import {
  createComment,
  deleteOwnComment,
  deleteOwnPost,
  fetchComments,
  fetchMyLikes,
  fetchPost,
  formatWhen,
  toggleLike,
  type CommunityComment,
  type CommunityPost,
} from "@/lib/community";
import { Avatar, BackIcon, CmIcon, CommentIcon, RankBadge } from "./shared";
import { displayNameOf, useAuth } from "@/lib/auth";

export default function PostDetail({ novelId, postId }: { novelId: number; postId: number }) {
  const router = useRouter();
  const { user, openLogin } = useAuth();
  const [post, setPost] = useState<CommunityPost | null | undefined>(undefined);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [liked, setLiked] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const myName = user ? displayNameOf(user) : null;

  const load = useCallback(async () => {
    const [p, c, l] = await Promise.all([fetchPost(postId), fetchComments(postId), fetchMyLikes([postId])]);
    setPost(p);
    setComments(c);
    setLiked(l.has(postId));
  }, [postId]);

  useEffect(() => {
    load();
  }, [load, user?.id]);

  function withIdentity(action: () => void) {
    if (user) action();
    else openLogin(action);
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(`/novel/${novelId}/community`);
  }

  function onLike() {
    if (!post) return;
    withIdentity(async () => {
      try {
        const r = await toggleLike(post.id);
        setLiked(r.liked);
        setPost({ ...post, likes_count: r.likes });
      } catch {}
    });
  }

  function send() {
    const body = text.trim();
    if (!body || busy) return;
    withIdentity(async () => {
      setBusy(true);
      setErr("");
      try {
        await createComment(postId, body);
        setText("");
        await load();
      } catch (e) {
        const m = e instanceof Error ? e.message : "";
        setErr(m.includes("rate_limited") ? COPY.composeLimit : COPY.offline);
      }
      setBusy(false);
    });
  }

  async function removePost() {
    if (!confirm(COPY.deleteConfirm)) return;
    try {
      await deleteOwnPost(postId);
      router.replace(`/novel/${novelId}/community`);
    } catch {}
  }

  async function removeComment(id: number) {
    if (!confirm(COPY.deleteCommentConfirm)) return;
    try {
      await deleteOwnComment(id);
      await load();
    } catch {}
  }

  // أزرار الحذف تظهر لكل أحد لكن السيرفر ينفّذها لصاحب المحتوى فقط؛ نخفيها بالواجهة بمقارنة الاسم (تقريبية)
  const mine = (name: string) => myName != null && name === myName;

  return (
    <div className="cm-root" dir="rtl">
      <div className="cm-top">
        <button className="cm-back" type="button" onClick={goBack} aria-label="رجوع">
          <BackIcon />
        </button>
        <h1>{COPY.postTitle}</h1>
      </div>

      {post === undefined && <div className="cm-state">{COPY.loading}</div>}
      {post === null && <div className="cm-state"><h3>{COPY.emptyTitle}</h3></div>}

      {post && (
        <>
          <article className="cm-detail">
            <div className="cm-post-row">
              <Avatar src={post.author_avatar} />
              <div className="cm-post-main">
                <div className="cm-post-head">
                  <span className="cm-name">{post.author_name}</span>
                  <RankBadge points={post.author_points} />
                  {post.author_title && <span className="cm-badge title">{post.author_title}</span>}
                  {post.is_featured && <span className="cm-badge feat">{COPY.featured}</span>}
                </div>
                <div className="cm-novel-line">
                  {COPY.inNovel}{" "}
                  <a href={`/novel/${post.novel_id}/community`} style={{ color: "#e5353e" }}>
                    «{post.novel_title}»
                  </a>
                </div>
              </div>
            </div>
            {post.title && <h2 className="cm-detail-title">{post.title}</h2>}
            <div className="cm-body">{post.body}</div>
            <div className="cm-actionbar">
              <span className="cm-foot-time">{formatWhen(post.created_at)}</span>
              {mine(post.author_name) && (
                <button className="cm-link-btn" type="button" onClick={removePost}>{COPY.deleteOwn}</button>
              )}
              <span className="cm-stat" style={{ marginInlineStart: "calc(40 * var(--cu))" }}>
                <CommentIcon />
                <span>{post.comments_count}</span>
              </span>
              <button type="button" className={`cm-stat${liked ? " is-liked" : ""}`} onClick={onLike} aria-label="إعجاب">
                <CmIcon name="like" w={32} h={32} />
                <span>{post.likes_count}</span>
              </button>
            </div>
          </article>

          <div className="cm-sec" />

          <section className="cm-clist">
            <h3>{COPY.comments} ({comments.length})</h3>
            {comments.length === 0 && <div className="cm-state" style={{ padding: "24px 0" }}>{COPY.noComments}</div>}
            {comments.map((c) => (
              <div key={c.id} className="cm-comment">
                <Avatar src={c.author_avatar} size={56} />
                <div className="cm-post-main">
                  <div className="cm-post-head">
                    <span className="cm-name">{c.author_name}</span>
                    <RankBadge points={c.author_points} />
                    {c.author_title && <span className="cm-badge title">{c.author_title}</span>}
                  </div>
                  <div className="cm-body">{c.body}</div>
                  <div className="cm-foot">
                    <span className="cm-foot-time">{formatWhen(c.created_at)}</span>
                    {mine(c.author_name) && (
                      <button className="cm-link-btn" type="button" onClick={() => removeComment(c.id)}>{COPY.deleteOwn}</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="cm-composer">
            <input
              className="cm-input"
              value={text}
              maxLength={1500}
              placeholder={COPY.commentPh}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="cm-submit" type="button" disabled={!text.trim() || busy} onClick={send}>
              {COPY.commentSend}
            </button>
          </div>
          {err && <div className="cm-error" style={{ position: "fixed", bottom: 80, insetInline: 16, textAlign: "center" }}>{err}</div>}
        </>
      )}

    </div>
  );
}
