import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getRoles } from '../../api/client';
import { getLocale } from '../../utils/locale';
import { trackEvent, getPrePageId } from '../../utils/track';
import type { Role } from '../../types/api';
import CharacterCard from '../../components/CharacterCard';
import styles from './ExplorePage.module.css';

const FILTER_TAGS = ['全部', '热门', '甜蜜', '撩人', '内敛', '傲娇'];
const PAGE_SIZE = 10;

export default function ExplorePage() {
  const t = getLocale();
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTag, setActiveTag] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScrollTop = useRef(0);

  const fetchRoles = useCallback(async (tag: string, p: number) => {
    if (p === 1) { setLoading(true); setHasError(false); } else setLoadingMore(true);
    try {
      const data = await getRoles({
        user_id: user?.userId,
        page: p,
        page_size: PAGE_SIZE,
        tag: tag === '全部' ? undefined : tag,
        sort: tag === '热门' ? 'latest' : undefined,
      });
      if (p === 1) {
        setRoles(data.roles);
      } else {
        setRoles((prev) => [...prev, ...data.roles]);
      }
      setHasMore(data.pagination?.has_more ?? false);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      if (p === 1) setHasError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.userId]);

  // Only fetch on first mount or when tag actually changes
  useEffect(() => {
    if (!loadedRef.current || activeTag) {
      fetchRoles(activeTag, 1);
      setPage(1);
      loadedRef.current = true;
    }
  }, [activeTag]); // eslint-disable-line react-hooks/exhaustive-deps

  // 埋点：探索页曝光
  // ExplorePage 始终挂载，能感知每次路由变化；用 ref 记录上一个路径
  const prevPathRef = useRef<string>('');
  // 记录本次进入 / 的时间，用于 clickAiCard 的 dwelltime
  const enterTimeRef = useRef<number>(0);
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' && prevPathRef.current !== '/') {
      // 冷启动若 start_param 会重定向走，跳过这次误报
      const isInitial = prevPathRef.current === '';
      const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
      const willRedirect = isInitial && !!sp && /^(chat|role)_/.test(sp);
      if (!willRedirect) {
        trackEvent('showExplore', { pre_page: getPrePageId() });
        enterTimeRef.current = Date.now();
      }
    }
    prevPathRef.current = path;
  }, [location.pathname]);

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
    // 埋点：点击角色卡片
    trackEvent('clickAiCard', {
      role_id: role.role_id,
      dwelltime: enterTimeRef.current ? Date.now() - enterTimeRef.current : 0,
      pre_page: 'explore',
    });
    // Save scroll position before leaving
    if (scrollRef.current) {
      savedScrollTop.current = scrollRef.current.scrollTop;
    }
    navigate(`/role/${role.role_id}`, { state: { role } });
  };

  // Restore scroll position when returning to this page
  useEffect(() => {
    if (location.pathname === '/' && scrollRef.current && savedScrollTop.current > 0) {
      scrollRef.current.scrollTop = savedScrollTop.current;
    }
  }, [location.pathname]);

  return (
    <div className="page-container">
      {/* Hero Section — sticky, does not scroll with cards */}
      <div className={styles.heroWrapper}>
        <div className={styles.contentWrapper}>
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>{t.exploreTitle}</h1>
            <p className={styles.heroSubtitle}>
              {t.exploreSubtitle}
            </p>
          </section>
        </div>
      </div>

      {/* Scrollable card list */}
      <div ref={scrollRef} className={`page-scroll ${styles.scrollArea}`}>
        <div className={styles.contentWrapper}>
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
          ) : hasError ? (
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
                <h2 className={styles.emptyHeading}>{t.exploreErrorHeading}</h2>
                <p className={styles.emptySubtext}>{t.exploreErrorSubtext}</p>
              </div>
              <button className={styles.retryBtn} onClick={() => fetchRoles(activeTag, 1)}>
                {t.exploreErrorRetry}
              </button>
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
                <h2 className={styles.emptyHeading}>{t.exploreEmptyHeading}</h2>
                <p className={styles.emptySubtext}>{t.exploreEmptySubtext}</p>
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
    </div>
  );
}
