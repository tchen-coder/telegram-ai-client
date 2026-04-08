import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getRoles } from '../../api/client';
import type { Role } from '../../types/api';
import CharacterCard from '../../components/CharacterCard';
import ExploreHeader from '../../components/TopAppBar';
import styles from './ExplorePage.module.css';

const FILTER_TAGS = ['All Stories', 'Trending', 'Sweet', 'Flirty', 'Introvert', 'Tsundere'];

export default function ExplorePage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTag, setActiveTag] = useState('All Stories');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchRoles = useCallback(async (tag: string, p: number) => {
    setLoading(true);
    try {
      const data = await getRoles({
        user_id: user?.userId,
        page: p,
        page_size: 20,
        tag: tag === 'All Stories' ? undefined : tag,
        sort: tag === 'Trending' ? 'latest' : undefined,
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
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchRoles(activeTag, 1);
    setPage(1);
  }, [activeTag, fetchRoles]);

  const handleCardClick = (role: Role) => {
    navigate(`/role/${role.id}`, { state: { role } });
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchRoles(activeTag, next);
  };

  return (
    <div className="page-container">
      {/* Sticky Header */}
      <ExploreHeader title="Explore" />

      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Discovery</h1>
        <p className={styles.heroSubtitle}>
          Find your midnight companion<br />
          in the velvet shadows.
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
            <p>No characters found</p>
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
              <button className={styles.loadMore} onClick={handleLoadMore}>
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
