"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COPY, type PostKind } from "@/lib/community-copy";
import {
  PAGE_SIZE,
  checkIn,
  compactCount,
  fetchCheckedIn,
  fetchMyLikes,
  fetchPinned,
  fetchPosts,
  fetchStats,
  kingdomLevel,
  toggleLike,
  type CommunityPost,
  type SortKey,
  type TabKey,
} from "@/lib/community";
import { BackIcon, CmIcon } from "./shared";
import { useAuth } from "@/lib/auth";
import PostCard from "./PostCard";
import Composer from "./Composer";

type NovelInfo = { id: number; title: string; cover_url: string | null };

const KIND_ORDER: (PostKind | "all")[] = ["all", "discussion", "review", "merch", "share", "fanwork", "other"];

export default function CommunityPage({ novel }: { novel: NovelInfo | null }) {
  const router = useRouter();
  const { user, openLogin } = useAuth();
  const novelId = novel?.id ?? null;

  const [tab, setTab] = useState<TabKey>("feed");
  const [kind, setKind] = useState<PostKind | "all">("all");
  const [sort, setSort] = useState<SortKey>("activity");
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [pinned, setPinned] = useState<CommunityPost[]>([]);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ posts: 0, members: 0 });
  const [checked, setChecked] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [headOpen, setHeadOpen] = useState(false);
  const [introH, setIntroH] = useState(0);
  const [composing, setComposing] = useState(false);

  const introRef = useRef<HTMLParagraphElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  // ───── تحميل القوائم ─────
  const uid = user?.id;
  const load = useCallback(
    async (from: number) => {
      const my = ++reqId.current;
      setLoading(true);
      const rows = await fetchPosts({ novelId, tab, kind, sort, from, q });
      if (my !== reqId.current) return;
      const likes = await fetchMyLikes(rows.map((r) => r.id));
      if (my !== reqId.current) return;
      setPosts((prev) => (from === 0 ? rows : [...prev, ...rows]));
      setLiked((prev) => {
        const n = from === 0 ? new Set<number>() : new Set(prev);
        likes.forEach((id) => n.add(id));
        return n;
      });
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [novelId, tab, kind, sort, q, uid]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  useEffect(() => {
    fetchStats(novelId).then(setStats);
    fetchPinned(novelId).then(setPinned);
    if (novelId != null) fetchCheckedIn(novelId).then(setChecked);
  }, [novelId, user?.id]);

  // تحميل تلقائي عند الوصول لآخر القائمة
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) load(posts.length);
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, posts.length, load]);

  useEffect(() => {
    if (introRef.current) setIntroH(introRef.current.scrollHeight + 12);
  }, [headOpen]);

  // ───── الهوية ─────
  function withIdentity(action: () => void) {
    if (user) action();
    else openLogin(action);
  }

  // ───── الإجراءات ─────
  function onLike(p: CommunityPost) {
    withIdentity(async () => {
      const was = liked.has(p.id);
      const apply = (isLiked: boolean, likes: number) => {
        setLiked((s) => {
          const n = new Set(s);
          isLiked ? n.add(p.id) : n.delete(p.id);
          return n;
        });
        setPosts((arr) => arr.map((x) => (x.id === p.id ? { ...x, likes_count: likes } : x)));
      };
      apply(!was, Math.max(0, p.likes_count + (was ? -1 : 1)));
      try {
        const r = await toggleLike(p.id);
        apply(r.liked, r.likes);
      } catch {
        apply(was, p.likes_count);
      }
    });
  }

  function onCheckIn() {
    if (novelId == null || checked) return;
    withIdentity(async () => {
      try {
        await checkIn(novelId);
        setChecked(true);
        fetchStats(novelId).then(setStats);
      } catch {}
    });
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(novelId != null ? `/novel/${novelId}` : "/");
  }

  const title = novel ? COPY.kingdomOf(novel.title) : COPY.globalTitle;
  const level = kingdomLevel(stats.posts);
  const sortLabel = COPY.sorts[sort];
  const showChips = tab === "feed";
  const empty = !loading && posts.length === 0 && pinned.length === 0;

  return (
    <div className="cm-root" dir="rtl">
      {/* ───── الهيدر ───── */}
      <header
        className={`cm-head${headOpen ? " is-open" : ""}`}
        style={{ ["--cm-intro-h" as string]: `${introH}px` }}
      >
        {novel?.cover_url && (
          <div className="cm-head-bg" style={{ backgroundImage: `url(${novel.cover_url})` }} aria-hidden />
        )}
        <div className="cm-head-shade" aria-hidden />
        <div className="cm-head-in">
          <button className="cm-back" type="button" onClick={goBack} aria-label="رجوع">
            <BackIcon />
          </button>
          {novel && (
            <button
              className={`cm-checkin${checked ? " is-done" : ""}`}
              type="button"
              disabled={checked}
              onClick={onCheckIn}
            >
              {checked ? COPY.checkedIn : COPY.checkIn}
            </button>
          )}
          <button className="cm-search" type="button" aria-label="بحث" onClick={() => setSearchOpen(true)}>
            <CmIcon name="search" w={35} h={35} />
          </button>

          <h1 className="cm-title"><span>{title}</span></h1>

          <div className="cm-meta">
            {novel && (
              <>
                <span className="cm-meta-item">
                  <CmIcon name="level" w={24} h={24} />
                  <span>{COPY.level(level)}</span>
                </span>
                <span className="cm-meta-sep" />
              </>
            )}
            <span className="cm-meta-item">
              <CmIcon name="flame" w={20} h={23} />
              <span>{COPY.members(compactCount(stats.members))}</span>
            </span>
            <span className="cm-meta-sep" />
            <span className="cm-meta-item">
              <CmIcon name="hash" w={23} h={22} />
              <span>{COPY.posts(compactCount(stats.posts))}</span>
            </span>
          </div>

          <p className="cm-intro" ref={introRef}>{novel ? COPY.intro(novel.title) : COPY.introGlobal}</p>

          <button className="cm-expand" type="button" aria-label="المزيد" aria-expanded={headOpen} onClick={() => setHeadOpen((v) => !v)}>
            <CmIcon name="chevron" w={34} h={14} />
          </button>
        </div>
      </header>

      {/* ───── اللوح الأبيض ───── */}
      <main className="cm-sheet">
        <div className="cm-tabs" role="tablist">
          {(["feed", "featured", "fanwork"] as TabKey[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              className={`cm-tab${tab === t ? " is-active" : ""}`}
              onClick={() => {
                setTab(t);
                setMenuOpen(false);
              }}
            >
              {COPY.tabs[t]}
            </button>
          ))}
        </div>

        <div className="cm-filter">
          {showChips ? (
            <div className="cm-chips">
              {KIND_ORDER.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`cm-chip${kind === k ? " is-active" : ""}`}
                  onClick={() => setKind(k)}
                >
                  {COPY.kinds[k]}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1 }} />
          )}
          <span className="cm-filter-div" />
          <button className="cm-sort" type="button" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
            <span>{sortLabel}</span>
            <CmIcon name="tri" w={21} h={16} />
          </button>
          {menuOpen && (
            <div className="cm-sort-menu" role="menu">
              {(Object.keys(COPY.sorts) as SortKey[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={s === sort ? "is-active" : ""}
                  onClick={() => {
                    setSort(s);
                    setMenuOpen(false);
                  }}
                >
                  {COPY.sorts[s]}
                </button>
              ))}
            </div>
          )}
        </div>

        {q && (
          <div className="cm-state" style={{ padding: "12px 16px 0", textAlign: "start" }}>
            «{q}» —{" "}
            <button className="cm-link-btn" style={{ marginInlineStart: 0, color: "#e5353e" }} onClick={() => setQ("")}>
              ×
            </button>
          </div>
        )}

        {tab === "feed" && !q && pinned.length > 0 && (
          <div className="cm-pins">
            {pinned.map((p) => (
              <a key={p.id} className="cm-pin" href={`/novel/${p.novel_id}/community/${p.id}`}>
                <span className="cm-pin-tag">{COPY.pinned}</span>
                <span className="cm-pin-text">{p.title || p.body}</span>
              </a>
            ))}
          </div>
        )}

        <div className={`cm-list${tab === "feed" && !q && pinned.length > 0 ? "" : " is-first"}`}>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} liked={liked.has(p.id)} showNovel={novelId == null} onLike={onLike} />
          ))}
        </div>

        {loading && <div className="cm-state">{COPY.loading}</div>}
        {empty && (
          <div className="cm-state">
            <h3>{COPY.emptyTitle}</h3>
            <div>{COPY.emptyBody}</div>
          </div>
        )}
        {hasMore && !loading && <div ref={sentinel} style={{ height: 1 }} />}
        {!hasMore && !loading && posts.length > 0 && <div className="cm-end">{COPY.noMore}</div>}
        {(hasMore || empty || loading) && <div style={{ height: "calc(200 * var(--cu))" }} />}
      </main>

      {/* ───── زر المشاركة ───── */}
      {novel && (
        <button className="cm-fab" type="button" onClick={() => withIdentity(() => setComposing(true))}>
          <CmIcon name="pencil" w={36} h={36} />
          <span>{COPY.publish}</span>
        </button>
      )}

      {/* ───── البحث ───── */}
      {searchOpen && (
        <div className="cm-overlay" style={{ alignItems: "flex-start" }} onClick={() => setSearchOpen(false)}>
          <form
            className="cm-modal"
            style={{ borderRadius: "0 0 20px 20px", maxHeight: "none" }}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const v = (new FormData(e.currentTarget).get("q") as string).trim();
              setQ(v.replace(/[%,()]/g, " "));
              setTab("feed");
              setSearchOpen(false);
            }}
          >
            <input className="cm-input" name="q" defaultValue={q} placeholder="ابحث في المنشورات…" autoFocus />
          </form>
        </div>
      )}

      {composing && novelId != null && (
        <Composer
          novelId={novelId}
          defaultKind={kind === "all" ? "discussion" : kind}
          onClose={() => setComposing(false)}
          onPosted={() => {
            setComposing(false);
            setTab("feed");
            setKind("all");
            setQ("");
            load(0);
            fetchStats(novelId).then(setStats);
          }}
        />
      )}
    </div>
  );
}
