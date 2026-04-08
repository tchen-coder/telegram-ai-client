import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getMyRoles, deleteMyRole } from '../../api/client';
import type { Role } from '../../types/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import styles from './MessagesPage.module.css';

export default function MessagesPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyRoles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMyRoles({ user_id: user.userId });
      setRoles(data.roles);
    } catch (err) {
      console.error('Failed to fetch my roles:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyRoles();
  }, [fetchMyRoles]);

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    setDeleting(true);
    try {
      await deleteMyRole({ user_id: user.userId, role_id: deleteTarget.id });
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete role:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleChat = (role: Role) => {
    navigate(`/chat/${role.id}`, { state: { role } });
  };

  return (
    <div className="page-container">
      <header className={styles.header}>
        <h1 className={styles.title}>Messages</h1>
      </header>

      <div className="page-scroll">
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : roles.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>💬</p>
            <p className={styles.emptyText}>No conversations yet</p>
            <p className={styles.emptyHint}>Start chatting from the Explore page</p>
          </div>
        ) : (
          <div className={styles.list}>
            {roles.map((role) => (
              <div
                key={role.id}
                className={styles.item}
                onClick={() => handleChat(role)}
              >
                <div className={styles.avatarWrapper}>
                  {role.avatar_url ? (
                    <img
                      className={styles.avatar}
                      src={role.avatar_url}
                      alt={role.name}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder} />
                  )}
                  <span className={styles.onlineDot} />
                </div>
                <div className={styles.info}>
                  <div className={styles.topRow}>
                    <span className={styles.name}>{role.name}</span>
                  </div>
                  <p className={styles.preview}>
                    {role.latest_reply || role.description || 'Start a conversation'}
                  </p>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(role);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Chat?"
        message={`Are you sure you want to delete your conversation with ${deleteTarget?.name}?`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
