import styles from "../pages/members/Members.module.css";

export default function MemberCard({ member }) {
  return (
    <div className={styles.card}>
      <h2>{member.member_name}</h2>
      <p>아이디: {member.in_game_id}</p>
      <p>지역: {member.region}</p>
      <p>티어: {member.tier}</p>
    </div>
  );
}
