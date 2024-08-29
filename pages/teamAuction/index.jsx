import Layout from "@/components/Layout";
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
  // 팀 리스트
  const [teamList, setTeamList] = useState();
  // 멤버 리스트
  const [memberList, setMemberList] = useState();
  // 현재 경매 멤버
  const [isLiveMember, setIsLiveMember] = useState();
  // 입찰 팀
  const [bidTeam, setBidTeam] = useState();
  // 현재 입찰 금액
  const [bidPrice, setBidPrice] = useState(0);
  // 최고 입찰 금액 - 입찰 금액보다 큰 금액만 입찰 가능 - 유저의 point에 저장
  // 타이머
  const [start, setStart] = useState(false);
  // 채팅방
  const [roomName, setRoomName] = useState();
  // 나의 팀
  const [myTeamInfo, setMyTeamInfo] = useState();

  const fetchTeamList = async () => {
    const { data, error } = await supabase.rpc("team_list");
    if (error) {
      console.error("Error fetching team list:", error);
    } else {
      setTeamList(data);
    }
  };

  const fetchMemberList = async () => {
    const { data, error } = await supabase.from("minions_member").select();
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
      ?.filter(
        (member) =>
          member.isLive === false &&
          member.dismissed === false &&
          !member.team_id
      ) // isLive가 false인 항목만 필터링
      .slice() // 원본 배열을 변형하지 않기 위해 복사
      .sort((a, b) => {
        // `number` 값이 있는 항목을 기준으로 정렬
        const numberA = a.number !== null ? a.number : Number.MAX_VALUE; // null인 경우 뒤로 배치
        const numberB = b.number !== null ? b.number : Number.MAX_VALUE;

        return numberA - numberB;
      });
  };

  // 유찰 멤버 목록
  const miscarriedMembers = (members) => {
    return members
      ?.filter((member) => member.isLive === false && member.dismissed === true) // isLive가 false인 항목만 필터링
      .slice(); // 원본 배열을 변형하지 않기 위해 복사
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

  // 최고 입찰액이 0일 경우 유찰 분류
  const miscarry = async () => {
    const responseMember = await supabase
      .from("minions_member")
      .update({
        point: 0,
        isLive: false,
      })
      .eq("id", isLiveMember.id)
      .select();
  };

  // 경매 대기로 변경
  const setLiveMember = async () => {
    function getRandomMember(memberList) {
      const randomIndex = Math.floor(Math.random() * memberList.length);
      return memberList[randomIndex];
    }

    // isLive가 true인 멤버가 있을 경우 업데이트
    if (!!isLiveMember) {
      await supabase
        .from("minions_member")
        .update({
          isLive: false,
        })
        .eq("id", isLiveMember.id);
    }

    // 랜덤 멤버를 선택하고 isLive를 true로 업데이트
    const randomMember = getRandomMember(memberList);

    await supabase
      .from("minions_member")
      .update({
        isLive: true,
      })
      .eq("id", randomMember.id)
      .select();
  };

  const imageMap = {
    top: topLane,
    jg: jgLane,
    mid: midLane,
    ad: adLane,
    sup: supLane,
  };

  const positionNames = {
    top: "탑",
    jg: "정글",
    mid: "미드",
    ad: "원딜",
    sup: "서폿",
  };

  useEffect(() => {
    // 채널 구독
    const member_update_channel = supabase
      .channel("member_update_channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "minions_member" },
        async (payload) => {
          console.log("member change received!", payload);
          await fetchMemberList(); // 멤버 리스트 재조회
        }
      )
      .subscribe();

    const team_update_channel = supabase
      .channel("team-update-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "minions_team" },
        async (payload) => {
          console.log("team change received!", payload);
          await fetchTeamList(); // 팀 리스트 재조회
        }
      )
      .subscribe();

    // unsubscribe 함수를 반환합니다.
    return () => {
      member_update_channel.unsubscribe();
      team_update_channel.unsubscribe();
    };
  }, []);

  // 컴포넌트 렌더링 시 초기 데이터 로드
  useEffect(() => {
    fetchTeamList();
    fetchMemberList();
  }, []);

  useEffect(() => {
    // 본인이 팀장인 팀의 정보 필터
    const selectMyTeam = (members) => {
      // login한 유저의 정보로 유저 id 추출
      const id = members
        ?.filter((member) => member.user_name === "team1")
        .slice()[0].id;

      const teamInfo = teamList
        ?.filter((team) => team.leader_id === id)
        .slice();

      setMyTeamInfo(teamInfo);
    };

    selectMyTeam(memberList);
  }, [memberList, teamList]);

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
                    style={{
                      color: item.team_color,
                    }}
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
            <div className={styles.live_member_box}>
              <Image
                src={imageMap[isLiveMember?.position] || auction_main}
                alt="/"
                width={300}
              />
            </div>
            <div className={styles.member_info}>
              <div>
                <h3>이름</h3>
                <h3>{isLiveMember?.member_name}</h3>
              </div>
              <div>
                <h3>아이디</h3>
                <h3>{isLiveMember?.in_game_id}</h3>
              </div>
              <div>
                <h3>티어</h3>
                <h3>{isLiveMember?.tier}</h3>
              </div>
              <div>
                <h3>라인</h3>
                <h3>{positionNames[isLiveMember?.position]}</h3>
              </div>
              <div>
                <h3>한마디</h3>
                <h3>{isLiveMember?.description}</h3>
              </div>
            </div>

            <div className={styles.chat_box_container}>
              <AuctionChat
                roomName={roomName}
                bidPrice={bidPrice}
                setBidPrice={setBidPrice}
                start={start}
                setStart={setStart}
                myTeamInfo={myTeamInfo && myTeamInfo[0]}
                isLiveMember={isLiveMember}
              />
            </div>
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
          <div className={`${styles.auction_box}`}>
            <h2 className={styles.waiting_list_title}>대기명단</h2>
            <div className={styles.waiting_list}>
              {processMembers(memberList)?.map((item, index) => (
                <div key={index} className={styles.waiting_member_list}>
                  <Image
                    src={imageMap[item.position] || ""}
                    alt="/"
                    width={60}
                  />
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
            <h3>유찰</h3>
            <div className={styles.waiting_list}>
              {miscarriedMembers(memberList)?.map((item, index) => (
                <div key={index} className={styles.waiting_member_list}>
                  <Image
                    src={imageMap[item.position] || ""}
                    alt="/"
                    width={60}
                  />
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
        </div>
      </section>
    </div>
  );
}

Index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
