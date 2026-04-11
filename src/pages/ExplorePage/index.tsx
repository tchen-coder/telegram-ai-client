import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getRoles } from '../../api/client';
import type { Role } from '../../types/api';
import CharacterCard from '../../components/CharacterCard';
import ExploreHeader from '../../components/TopAppBar';
import styles from './ExplorePage.module.css';

const FILTER_TAGS = ['全部', '热门', '甜蜜', '撩人', '内敛', '傲娇'];

export default function ExplorePage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTag, setActiveTag] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchRoles = useCallback(async (tag: string, p: number) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const data = await getRoles({
        user_id: user?.userId,
        page: p,
        page_size: 20,
        tag: tag === '全部' ? undefined : tag,
        sort: tag === '热门' ? 'latest' : undefined,
      });
      if (p === 1) {
        setRoles(data.roles);
      } else {
        setRoles((prev) => [...prev, ...data.roles]);
      }
      setHasMore(data.pagination.has_more);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchRoles(activeTag, 1);
    setPage(1);
  }, [activeTag, fetchRoles]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchRoles(activeTag, next);
  }, [loadingMore, hasMore, page, activeTag, fetchRoles]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  const handleCardClick = (role: Role) => {
    navigate(`/role/${role.id}`, { state: { role } });
  };

  return (
    <div className="page-container">
      {/* Sticky Header */}
      <ExploreHeader title="秘语" />

      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>探索</h1>
        <p className={styles.heroSubtitle}>
          深夜不孤单，总有人陪你
        </p>
      </section>

      {/* Filter Chips */}
      <div className={styles.filters}>
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag}
            className={`${styles.chip} ${activeTag === tag ? styles.chipActive : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Character List */}
      <div className="page-scroll">
        {loading && roles.length === 0 ? (
          <div className={styles.skeleton}>
            {[1, 2].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonInfo}>
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  <div className={styles.skeletonLine} style={{ width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyGlow} />
            <div className={styles.emptyVisual}>
              <div className={styles.emptyCircle}>
                <div className={styles.emptyCircleInner}>
                  <img className={styles.emptyCircleImg} src={new URL('../../assets/explore-empty-avatar.webp', import.meta.url).href} alt="" />
                  <div className={styles.emptyCircleSaturation} />
                  <div className={styles.emptyCircleOverlay} />
                  <div className={styles.emptyGlitchLine} />
                </div>
              </div>
            </div>
            <div className={styles.emptyTextBlock}>
              <h2 className={styles.emptyHeading}>还没人出现</h2>
              <p className={styles.emptySubtext}>
                还没有陪伴上线，请稍等片刻。
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.cardList}>
              {roles.map((role) => (
                <CharacterCard
                  key={role.id}
                  role={role}
                  onClick={() => handleCardClick(role)}
                />
              ))}
            </div>
            {hasMore && (
              <div ref={sentinelRef} className={styles.loadMoreArea}>
                {loadingMore && (
                  <div className={styles.spinner} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
