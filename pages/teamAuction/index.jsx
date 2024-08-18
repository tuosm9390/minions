import Layout from "@/components/Layout";
import Timer from "@/components/Timer";
import Image from "next/image";
import React from "react";
import botLane from "../../public/botLane.webp";
import jgLane from "../../public/jgLane.png";
import midLane from "../../public/midLane.png";
import supLane from "../../public/supLane.png";
import topLane from "../../public/topLane.png";
import styles from "./teamAuction.module.css";

export default function index() {
  return (
    <div className={styles.container}>
      <h1>리그전 팀 경매</h1>
      <section className={styles.content_container}>
        <div className={styles.auctionBox_container}>
          <div className={`${styles.auction_box} ${styles.team_list}`}>
            <h2 className={styles.team_list_title}>팀 리스트</h2>
            {Array.from({ length: 8 }).map((item, index) => (
              <div
                key={index}
                className={styles.team_box}
              >
                <h3 className={styles.team_name}>팀명</h3>
                <div className={styles.member}>
                  <Image
                    src={topLane}
                    alt="topLane"
                    width={25}
                  />
                </div>
                <div className={styles.member}>
                  <Image
                    src={jgLane}
                    alt="jgLane"
                    width={25}
                  />
                </div>
                <div className={styles.member}>
                  <Image
                    src={midLane}
                    alt="midLane"
                    width={25}
                  />
                </div>
                <div className={styles.member}>
                  <Image
                    src={botLane}
                    alt="botLane"
                    width={25}
                  />
                </div>
                <div className={styles.member}>
                  <Image
                    src={supLane}
                    alt="supLane"
                    width={25}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={`${styles.auction_box} ${styles.live_member}`}>
            <h2>현재 인원</h2>
            <div className={styles.live_member_box}></div>
            <h3>이름</h3>
            <h3>티어</h3>
            <h3>라인</h3>
            <h3>각오</h3>

            <Timer className={styles.timer} />
          </div>
          <div className={`${styles.auction_box} ${styles.waiting_list}`}>
            <h2 className={styles.waiting_list_title}>대기명단</h2>
            {Array.from({ length: 40 }).map((item, index) => (
              <div
                key={index}
                className={styles.waiting_member_list}
              >
                <Image
                  src=""
                  alt=""
                  width={100}
                />
                <span>이름</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
