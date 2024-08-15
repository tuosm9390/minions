import Layout from '@/components/Layout';
import MemberCard from '@/components/MemberCard';
import styles from '@/styles/Members.module.css';

const members = [
  { name: '홍길동', gameId: 'minion123', region: '서울', tier: '플래티넘' },
  { name: '김철수', gameId: 'minion456', region: '부산', tier: '골드' },
  // 추가 회원 정보...
];

export default function Members() {
  return (
    <div className={styles.container}>
      <h1>모임원 소개</h1>
      <div className={styles.cardContainer}>
        {members.map((member, index) => (
          <MemberCard key={index} member={member} />
        ))}
      </div>
    </div>
  );
}

Members.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}