import Layout from "@/components/Layout";
import Timer from "@/components/Timer";
import Image from "next/image";
import adLane from "../../public/botLane.webp";
import jgLane from "../../public/jgLane.png";
import midLane from "../../public/midLane.png";
import supLane from "../../public/supLane.png";
import topLane from "../../public/topLane.png";
import styles from "./teamAuction.module.css";
import { supabase } from "@/supabase.config";

const { data: teamList } = await supabase.from("minions_team").select();
const { data: memberList } = await supabase.from("minions_member").select();

// 회원 목록을 필터링하고 정렬하는 함수
const processMembers = (members) => {
  return members
    .filter((member) => member.isLive === false) // isLive가 false인 항목만 필터링
    .slice() // 원본 배열을 변형하지 않기 위해 복사
    .sort((a, b) => {
      // `number` 값이 있는 항목을 기준으로 정렬
      const numberA = a.number !== null ? a.number : Number.MAX_VALUE; // null인 경우 뒤로 배치
      const numberB = b.number !== null ? b.number : Number.MAX_VALUE;

      return numberA - numberB;
    });
};

const isLiveMember = memberList.filter((member) => member.isLive === true)[0];

const imageMap = {
  top: topLane,
  jg: jgLane,
  mid: midLane,
  ad: adLane,
  sup: supLane,
};

export default function index() {
  return (
    teamList &&
    memberList && (
      <div className={styles.container}>
        <h1>리그전 팀 경매</h1>
        <section className={styles.content_container}>
          <div className={styles.auctionBox_container}>
            <div className={`${styles.auction_box} ${styles.team_list}`}>
              <h2 className={styles.team_list_title}>팀 리스트</h2>
              {teamList.map((item, index) => (
                <div key={index} className={styles.team_box}>
                  <h3 className={styles.team_name}>{item.team_name}</h3>
                  <div className={styles.member}>
                    <Image src={topLane} alt="topLane" width={25} />
                  </div>
                  <div className={styles.member}>
                    <Image src={jgLane} alt="jgLane" width={25} />
                  </div>
                  <div className={styles.member}>
                    <Image src={midLane} alt="midLane" width={25} />
                  </div>
                  <div className={styles.member}>
                    <Image src={adLane} alt="adLane" width={25} />
                  </div>
                  <div className={styles.member}>
                    <Image src={supLane} alt="supLane" width={25} />
                  </div>
                </div>
              ))}
            </div>
            <div className={`${styles.auction_box} ${styles.live_member}`}>
              <h2>현재 인원</h2>
              <div className={styles.live_member_box}>
                <Image
                  src={imageMap[isLiveMember.position] || ""}
                  alt="/"
                  width={300}
                />
              </div>
              <div className={styles.member_info}>
                <h3>이름</h3>
                <h3>{isLiveMember.member_name}</h3>
                <h3>티어</h3>
                <h3>{isLiveMember.tier}</h3>
                <h3>라인</h3>
                <h3>{isLiveMember.position}</h3>
                <h3>각오</h3>
                <h3>{isLiveMember.description}</h3>
              </div>

              <Timer className={styles.timer} />
            </div>
            <div className={`${styles.auction_box} ${styles.waiting_list}`}>
              <h2 className={styles.waiting_list_title}>대기명단</h2>
              {processMembers(memberList).map((item, index) => (
                <div key={index} className={styles.waiting_member_list}>
                  <Image
                    src={imageMap[item.position] || ""}
                    alt="/"
                    width={60}
                  />
                  <div className={styles.waiting_member_list_name}>
                    <span>{item.member_name}</span>
                    <Image
                      src={imageMap[item.position] || ""}
                      alt="/"
                      width={15}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  );
}

index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
