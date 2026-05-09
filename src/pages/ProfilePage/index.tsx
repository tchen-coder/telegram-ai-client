import { useState } from 'react';
import { useApp } from '../../store/appStore';
import styles from './ProfilePage.module.css';

/* Figma 233:78 — icon assets */
const iconSubscription = new URL('../../assets/icon-subscription.svg', import.meta.url).href;
const iconChevron = new URL('../../assets/icon-chevron.svg', import.meta.url).href;
const iconLock = new URL('../../assets/icon-lock.svg', import.meta.url).href;
const iconHeart = new URL('../../assets/icon-heart.svg', import.meta.url).href;
const iconPlus = new URL('../../assets/icon-plus.svg', import.meta.url).href;
const iconNotifications = new URL('../../assets/icon-notifications.svg', import.meta.url).href;
const iconChevronSm = new URL('../../assets/icon-chevron-sm.svg', import.meta.url).href;
const iconAppearance = new URL('../../assets/icon-appearance.svg', import.meta.url).href;
const iconLanguage = new URL('../../assets/icon-language.svg', import.meta.url).href;
const iconSupport = new URL('../../assets/icon-support.svg', import.meta.url).href;

/* Favorite character placeholder images from Figma */
const favImgJulian = new URL('../../assets/fav-julian.jpg', import.meta.url).href;
const favImgSera = new URL('../../assets/fav-sera.jpg', import.meta.url).href;

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
