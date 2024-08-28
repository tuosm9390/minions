/* eslint-disable @next/next/no-img-element */
import Layout from "@/components/Layout";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Minions 모임에 오신 것을 환영합니다!</h1>
      <p>잘 먹은 미니언 하나, 열 킬 안 부럽고,</p>
      <p>잘 사귄 씹덕 친구 하나, 열 인싸 친구 안 부럽다.</p>

      {/* 모임 소개글 작성 공간 */}
      <div className={styles.introSection}>
        <h2>모임 소개글</h2>
        <textarea
          className={styles.introTextarea}
          placeholder="모임에 대한 소개글을 작성하세요..."
          rows="5"
        />
      </div>

      {/* 사진 표시 공간 */}
      <div className={styles.photoSection}>
        <h2>모임 사진</h2>
        <div className={styles.photoGrid}>
          <div className={styles.photo}>
            <img src="/path/to/photo1.jpg" alt="Photo 1" />
          </div>
          <div className={styles.photo}>
            <img src="/path/to/photo2.jpg" alt="Photo 2" />
          </div>
          <div className={styles.photo}>
            <img src="/path/to/photo3.jpg" alt="Photo 3" />
          </div>
          {/* 추가 사진 */}
        </div>
      </div>
    </div>
  );
}

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
