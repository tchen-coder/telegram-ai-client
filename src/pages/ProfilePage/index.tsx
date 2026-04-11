import { useState } from 'react';
import { useApp } from '../../store/appStore';
import styles from './ProfilePage.module.css';

/* Figma 233:78 — icon assets */
const iconSubscription = 'https://www.figma.com/api/mcp/asset/b983c40c-7457-4e51-9820-5c9dadb7787e';
const iconChevron = 'https://www.figma.com/api/mcp/asset/3ba19321-e6bc-4348-b628-33d91bbcd828';
const iconLock = 'https://www.figma.com/api/mcp/asset/14832130-4b03-421d-a9e8-a69d8da870a7';
const iconHeart = 'https://www.figma.com/api/mcp/asset/1012c410-5455-4e44-8622-b549fd977afb';
const iconPlus = 'https://www.figma.com/api/mcp/asset/10c4eab6-b30b-4c60-8cac-dc524d8d5bb5';
const iconNotifications = 'https://www.figma.com/api/mcp/asset/fa0e572d-081c-4a5a-890f-6399d8850e00';
const iconChevronSm = 'https://www.figma.com/api/mcp/asset/6ff020e5-4412-4d4b-aa8c-598f467b009e';
const iconAppearance = 'https://www.figma.com/api/mcp/asset/5d156769-fba4-4eee-8286-d2fbe7ca9cda';
const iconLanguage = 'https://www.figma.com/api/mcp/asset/e967e25e-2e85-43d6-aaf5-b43451eec365';
const iconSupport = 'https://www.figma.com/api/mcp/asset/e39217eb-9188-4190-a665-ba9e000746c4';

/* Favorite character placeholder images from Figma */
const favImgJulian = 'https://www.figma.com/api/mcp/asset/4915eb2c-326f-4929-853d-491b7d762f45';
const favImgSera = 'https://www.figma.com/api/mcp/asset/19f5a6b4-b86d-431f-bc19-5fd7e74a2782';

export default function ProfilePage() {
  const { user } = useApp();
  const [privacyOn, setPrivacyOn] = useState(true);

  return (
    <div className="page-container">
      <div className="page-scroll">
        <div className={styles.main}>
          {/* ===== Profile Header ===== */}
          <div className={styles.headerSection}>
            <div className={styles.avatarContainer}>
              {/* Glow behind avatar */}
              <div className={styles.avatarGlow} />
              {/* Avatar circle */}
              <div className={styles.avatarBorder}>
                <div className={styles.avatarInner}>
                  <div className={styles.avatarPlaceholder}>
                    <span className={styles.avatarInitial}>
                      {user?.userName?.charAt(0) || 'D'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Premium badge */}
              <div className={styles.premiumBadge}>
                <span className={styles.premiumText}>高级</span>
              </div>
            </div>
            {/* Username */}
            <div className={styles.nameMargin}>
              <h1 className={styles.userName}>{user?.userName || 'Dean'}</h1>
            </div>
          </div>

          {/* ===== Bento Grid ===== */}
          <div className={styles.bentoGrid}>
            {/* --- My Subscriptions --- */}
            <div className={styles.card}>
              <div className={styles.cardTopRow}>
                <img alt="" className={styles.cardIcon} src={iconSubscription} />
                <img alt="" className={styles.chevronIcon} src={iconChevron} />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>我的订阅</h3>
                <p className={styles.cardSubtitle}>管理高级会员与专业版权限</p>
              </div>
              <div className={styles.badgeRow}>
                <span className={styles.activeBadge}>已激活：精英版</span>
              </div>
            </div>

            {/* --- Privacy Lock --- */}
            <div className={styles.card}>
              <div className={styles.cardTopRow}>
                <img alt="" className={styles.lockIcon} src={iconLock} />
                <div
                  className={`${styles.toggle} ${privacyOn ? styles.toggleOn : ''}`}
                  onClick={() => setPrivacyOn(!privacyOn)}
                >
                  <div className={styles.toggleTrack} />
                  <div className={styles.toggleKnob} />
                </div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>隐私锁</h3>
                <p className={styles.cardSubtitle}>生物识别安全已启用</p>
              </div>
            </div>

            {/* --- My Favorites --- */}
            <div className={styles.card}>
              <div className={styles.favoritesHeader}>
                <div className={styles.favoritesTitleRow}>
                  <img alt="" className={styles.heartIcon} src={iconHeart} />
                  <h3 className={styles.cardTitle}>我的收藏</h3>
                </div>
                <span className={styles.viewAll}>查看全部</span>
              </div>
              <div className={styles.favoritesScroll}>
                <div className={styles.favoriteItem}>
                  <div className={styles.favoriteImgBorder}>
                    <img alt="" className={styles.favoriteImg} src={favImgJulian} />
                  </div>
                  <span className={styles.favoriteName}>JULIAN</span>
                </div>
                <div className={styles.favoriteItem}>
                  <div className={styles.favoriteImgBorder}>
                    <img alt="" className={styles.favoriteImg} src={favImgSera} />
                  </div>
                  <span className={styles.favoriteName}>SERA</span>
                </div>
                <div className={styles.favoriteItem}>
                  <div className={styles.favoriteAdd}>
                    <img alt="" className={styles.plusIcon} src={iconPlus} />
                  </div>
                  <span className={styles.favoriteNameMuted}>新增</span>
                </div>
              </div>
            </div>

            {/* --- App Settings --- */}
            <div className={styles.settingsSection}>
              <h4 className={styles.settingsLabel}>应用设置</h4>
              <div className={styles.settingsCard}>
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <img alt="" className={styles.settingIcon} src={iconNotifications} />
                    <span className={styles.settingLabel}>通知</span>
                  </div>
                  <img alt="" className={styles.chevronIcon} src={iconChevronSm} />
                </div>
                <div className={styles.settingDivider} />
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <img alt="" className={styles.settingIcon} src={iconAppearance} />
                    <span className={styles.settingLabel}>外观</span>
                  </div>
                  <span className={styles.settingValue}>暗夜黑</span>
                </div>
                <div className={styles.settingDivider} />
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <img alt="" className={styles.settingIcon} src={iconLanguage} />
                    <span className={styles.settingLabel}>语言</span>
                  </div>
                  <span className={styles.settingValue}>简体中文</span>
                </div>
                <div className={styles.settingDivider} />
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <img alt="" className={styles.settingIconSupport} src={iconSupport} />
                    <span className={styles.settingLabel}>帮助与反馈</span>
                  </div>
                  <img alt="" className={styles.chevronIcon} src={iconChevronSm} />
                </div>
              </div>
            </div>

            {/* --- Sign Out --- */}
            <div className={styles.logoutSection}>
              <button className={styles.signOutBtn}>退出登录</button>
              <p className={styles.version}>版本 2.4.0 (Build 892)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
