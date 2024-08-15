/* eslint-disable @next/next/no-img-element */
import Layout from '@/components/Layout';
import styles from '@/styles/Photos.module.css';

const photos = [
  '/path/to/photo1.jpg',
  '/path/to/photo2.jpg',
  '/path/to/photo3.jpg',
  // 추가 사진 경로...
];

export default function Photos() {
  return (
    <div className={styles.container}>
      <h1>모임 사진 갤러리</h1>
      <div className={styles.photoGrid}>
        {photos.map((photo, index) => (
          <div className={styles.photo} key={index}>
            <img src={photo} alt={`Photo ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

Photos.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}