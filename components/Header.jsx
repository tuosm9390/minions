import Link from "next/link";
import styles from "./Header.module.css";
import { useScrollContext } from "./ScrollContext";

function Header({ isVisible }) {
  const { handleScroll, activeSection } = useScrollContext();

  return (
    <nav
      className={`${styles.navbar_container} ${
        isVisible ? styles.visible : styles.hidden
      }`}
    >
      <div className={styles.navbarBox}>
        <ul className={`${styles.menuList} ${styles.logo}`}>
          <Link href="/">로고</Link>
        </ul>
      </div>
      <div className={styles.navbarBox}>
        <ul className={styles.menuList}>
          <Link href="/members">모임원 소개</Link>
          <Link href="/photos">모임 사진 보기</Link>
          <Link href="/teamAuction">리그전 팀 경매</Link>
        </ul>
      </div>
    </nav>
  );
}

export default Header;
