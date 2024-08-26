import Layout from "@/components/Layout";
import Timer from "@/components/Timer";
import Image from "next/image";
import adLane from "../../public/botLane.webp";
import jgLane from "../../public/jgLane.webp";
import midLane from "../../public/midLane.webp";
import supLane from "../../public/supLane.webp";
import topLane from "../../public/topLane.webp";
import auction_main from "../../public/auction_main.webp";
import styles from "./teamAuction.module.css";
import { supabase } from "@/supabase.config";
import { useState, useEffect } from "react";
import AuctionChat from "@/components/AuctionChat";

export default function Index() {
  const [teamList, setTeamList] = useState();
  const [memberList, setMemberList] = useState();
  const [isLiveMember, setIsLiveMember] = useState();
  const [bidTeam, setBidTeam] = useState();
  const [bidPrice, setBidPrice] = useState(0);
  const [start, setStart] = useState(false);
  const [roomName, setRoomName] = useState();

  const fetchTeamList = async () => {
    const { data, error } = await supabase.rpc("team_list");
    if (error) {
      console.error("Error fetching team list:", error);
    } else {
      setTeamList(data);
    }
  };

  const fetchMemberList = async () => {
    const { data, error } = await supabase
      .from("minions_member")
      .select()
      .is("team_id", null);
    if (error) {
      console.error("Error fetching member list:", error);
    } else {
      setMemberList(data);
      const isLiveMember = data.filter((member) => member.isLive === true)[0];
      setIsLiveMember(isLiveMember);
    }
  };

  // 회원 목록을 필터링하고 정렬하는 함수
  const processMembers = (members) => {
    return members
      ?.filter((member) => member.isLive === false) // isLive가 false인 항목만 필터링
      .slice() // 원본 배열을 변형하지 않기 위해 복사
      .sort((a, b) => {
        // `number` 값이 있는 항목을 기준으로 정렬
        const numberA = a.number !== null ? a.number : Number.MAX_VALUE; // null인 경우 뒤로 배치
        const numberB = b.number !== null ? b.number : Number.MAX_VALUE;

        return numberA - numberB;
      });
  };

  // 입찰 진행
  // 채팅으로 진행 socket io 사용
  const placeBid = () => {};

  // 낙찰
  const successfulBid = async () => {
    const responseMember = await supabase
      .from("minions_member")
      .update({
        team_id: bidTeam.id,
        team_name: bidTeam.team_name,
        point: bidPrice,
        isLive: false,
      })
      .eq("id", isLiveMember.id)
      .select();

    const responseTeam = await supabase
      .from("minions_team")
      .update({
        [isLiveMember.position]: isLiveMember.id,
        remain_point: bidTeam.initial_point - bidPrice,
      })
      .eq("id", bidTeam.id)
      .select();
  };

  // 경매 대기로 변경
  const setLiveMember = async () => {
    function getRandomMember(memberList) {
      const randomIndex = Math.floor(Math.random() * memberList.length);
      return memberList[randomIndex];
    }

    const randomMember = getRandomMember(memberList);

    await supabase
      .from("minions_member")
      .update({
        isLive: true,
      })
      .eq("id", randomMember.id)
      .select();
  };

  // 최고 입찰액이 0일 경우 유찰 분류

  const imageMap = {
    top: topLane,
    jg: jgLane,
    mid: midLane,
    ad: adLane,
    sup: supLane,
  };

  useEffect(() => {
    // 채널 구독
    const table_update_channel = supabase
      .channel("table-update-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "*" },
        async (payload) => {
          console.log("Member change received!", payload);
          await fetchTeamList(); // 팀 리스트 재조회
          await fetchMemberList(); // 멤버 리스트 재조회
        }
      )
      .subscribe();

    // unsubscribe 함수를 반환합니다.
    return () => {
      table_update_channel.unsubscribe();
    };
  }, []);

  // 컴포넌트 렌더링 시 초기 데이터 로드
  useEffect(() => {
    fetchTeamList();
    fetchMemberList();
  }, []);

  // room_name을 입력받아 해당 id를 반환하는 함수
  const getRoomIdByName = async () => {
    const inputRoomName = window.prompt("room_name을 입력하세요:"); // room_name 입력받기

    // Supabase에서 room_name에 해당하는 방 조회
    const { data, error } = await supabase
      .from("chat_room") // 테이블 이름
      .select() // 선택할 컬럼
      .eq("room_name", `${inputRoomName}`); // 조건

    if (error) {
      window.alert("에러 발생: " + error.message); // 에러 처리
    } else if (data.length > 0) {
      // window.alert(`ID: ${data[0].id}`); // ID 출력
      setRoomName(data[0].id);
    } else {
      window.alert("일치하는 방이 없습니다."); // 방이 없을 경우
    }
  };

  return (
    <div className={styles.container}>
      <h1>리그전 팀 경매</h1>
      <section className={styles.content_container}>
        <div className={styles.auctionBox_container}>
          <div className={`${styles.auction_box} ${styles.team_list}`}>
            <h2 className={styles.team_list_title}>팀 리스트</h2>
            {teamList?.map((item, index) => (
              <div key={index} className={styles.team_box}>
                <div className={styles.team_name_box}>
                  <h3
                    className={styles.team_name}
                    onClick={() => setBidTeam(item)}
                  >
                    {item.team_name}
                  </h3>
                  <div className={styles.remain_point}>
                    <span>{item.remain_point}P</span>
                  </div>
                </div>
                <div className={styles.member}>
                  <Image src={topLane} alt="topLane" width={25} />
                  <span>{item.top_member_name}</span>
                </div>
                <div className={styles.member}>
                  <Image src={jgLane} alt="jgLane" width={25} />
                  <span>{item.jg_member_name}</span>
                </div>
                <div className={styles.member}>
                  <Image src={midLane} alt="midLane" width={25} />
                  <span>{item.mid_member_name}</span>
                </div>
                <div className={styles.member}>
                  <Image src={adLane} alt="adLane" width={25} />
                  <span>{item.ad_member_name}</span>
                </div>
                <div className={styles.member}>
                  <Image src={supLane} alt="supLane" width={25} />
                  <span>{item.sup_member_name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={`${styles.auction_box} ${styles.live_member}`}>
            <h2>현재 인원</h2>
            <div className={styles.live_member_box}>
              <Image
                src={imageMap[isLiveMember?.position] || auction_main}
                alt="/"
                width={300}
              />
            </div>
            <div className={styles.member_info}>
              <h3>이름</h3>
              <h3>{isLiveMember?.member_name}</h3>
              <h3>아이디</h3>
              <h3>{isLiveMember?.in_game_id}</h3>
              <h3>티어</h3>
              <h3>{isLiveMember?.tier}</h3>
              <h3>라인</h3>
              <h3>{isLiveMember?.position}</h3>
              <h3>각오</h3>
              <h3>{isLiveMember?.description}</h3>
            </div>
          </div>
          <div className={`${styles.auction_box} ${styles.waiting_list}`}>
            <h2 className={styles.waiting_list_title}>대기명단</h2>
            {processMembers(memberList)?.map((item, index) => (
              <div key={index} className={styles.waiting_member_list}>
                <Image src={imageMap[item.position] || ""} alt="/" width={60} />
                <div className={styles.waiting_member_list_name}>
                  <span>{item.in_game_id}</span>
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
        <div className={styles.footer_container}>
          <div className={styles.chat_box_container}>
            {/* <textarea
              className={styles.chat_box}
              readonly="readonly"
            ></textarea> */}
            <AuctionChat roomName={roomName} bidPrice={bidPrice} setBidPrice={setBidPrice} />
          </div>
          <Timer className={styles.timer} start={start} setStart={setStart} />
          <button type="button" onClick={() => successfulBid()}>
            낙찰
          </button>
          <button type="button" onClick={() => setLiveMember()}>
            뽑기
          </button>
          <button type="button" onClick={() => getRoomIdByName()}>
            방 입장
          </button>
        </div>
      </section>
    </div>
  );
}

Index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
