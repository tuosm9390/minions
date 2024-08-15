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
          <div className={`${styles.auctionBox} ${styles.teamList}`}>
            {Array.from({ length: 8 }).map((item, index) => (
              <div
                key={index}
                className={styles.teamBox}
              >
                <h3 className={styles.teamName}>팀명</h3>
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
          <div className={styles.auctionBox}></div>
          <div className={styles.auctionBox}></div>
        </div>

        <Timer />
      </section>
    </div>
  );
}

index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
