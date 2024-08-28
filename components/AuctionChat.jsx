import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabase.config";
import styles from "./AuctionChat.module.css";
import Timer from "./Timer";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import TimerComponent from "./TimerComponent";

const AuctionChat = ({
  roomName,
  bidPrice,
  setBidPrice,
  start,
  setStart,
  myTeamInfo,
  isLiveMember,
}) => {
  // 상태 변수
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [seconds, setSeconds] = useState(15); // 시작 시간을 15초로 설정
  const [milliseconds, setMilliseconds] = useState(0); // 밀리초 상태

  const [observer, setObserver] = useState(true);

  useEffect(() => {
    // 채널 구독
    const chat_update_channel = supabase
      .channel("chat-update-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setChatHistory((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    // 초기 채팅 내역 가져오기
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomName)
        .order("created_at", { ascending: true });
      setChatHistory(data);
    };

    fetchMessages();

    console.log(roomName);

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      chat_update_channel.unsubscribe();
    };
  }, [roomName]);

  // 메시지 전송 함수
  const sendMessage = async () => {
    if (bidPrice > isLiveMember.point) {
      // 메세지 저장
      await supabase.from("messages").insert([
        {
          user_id: myTeamInfo.id,
          content: `${myTeamInfo.leader_member_name} 팀장 - ${isLiveMember.member_name} - ${bidPrice}포인트 입찰`,
          room_id: "4c142acb-a028-48bb-9fe8-4fba92c3fa52",
        },
      ]); // 메시지 삽입
      setBidPrice(0); // 입력 필드 초기화

      // 현재 경매인원 point 저장
      await supabase
        .from("minions_member")
        .update({
          point: bidPrice,
        })
        .eq("id", isLiveMember.id);
    } else {
      window.alert("현재 입찰 금액보다 커야합니다.");
    }

    setBidPrice(0);
  };

  // 숫자만 입력 허용
  const handleBidPriceChange = (e) => {
    const value = e.target.value;

    // 입력값이 비어있거나 0일 경우 처리
    if (value === "") {
      setBidPrice(0); // 빈 문자열일 경우 0으로 설정
    } else {
      const numericValue = Number(value);
      if (numericValue > 0) {
        setBidPrice(numericValue); // 0보다 큰 숫자일 경우 업데이트
      } else {
        setBidPrice(0); // 0일 경우 0으로 설정
      }
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]); // chatHistory가 업데이트될 때마다 스크롤

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        {roomName && (
          <>
            <div className={styles.chat_box} ref={chatContainerRef}>
              {chatHistory?.map((msg) => {
                const parts = msg.content.split(" - "); // "-"로 분리
                const team_leader = parts[0];
                const auction_member = parts[1];
                const points = parts[2];

                return (
                  <div key={msg.id} className={styles.entry}>
                    <span
                      className={styles.team_leader_text}
                      style={{
                        color: myTeamInfo?.team_color,
                      }}
                    >
                      {team_leader}
                    </span>{" "}
                    - {auction_member}
                    {" - "}
                    <span className={styles.point}>{points}</span>
                  </div>
                );
              })}
            </div>
            {/*             
              관전자 - 다음 사람 설정, 경매 시작, 타이머일시정지, 경매 취소, 타이머
              경매자 - 타이머, 잔여포인트, 입찰포인트, 입찰버튼
            */}
            {!observer ? (
              <>
                <div
                  className={styles.timer_container}
                  style={{ color: "white" }}
                >
                  <Timer
                    className={styles.timer}
                    start={start}
                    setStart={setStart}
                    seconds={seconds}
                    setSeconds={setSeconds}
                    milliseconds={milliseconds}
                    setMilliseconds={setMilliseconds}
                  />
                  <button
                    onClick={() =>
                      setBidPrice((prevBidPrice) => prevBidPrice + 5)
                    }
                  >
                    +5
                  </button>
                  <button
                    onClick={() =>
                      setBidPrice((prevBidPrice) => prevBidPrice + 10)
                    }
                  >
                    +10
                  </button>
                  <button
                    onClick={() =>
                      setBidPrice((prevBidPrice) => prevBidPrice + 50)
                    }
                  >
                    +50
                  </button>
                  <button
                    onClick={() =>
                      setBidPrice((prevBidPrice) => prevBidPrice + 100)
                    }
                  >
                    +100
                  </button>
                </div>
                <div className={styles.bid_container}>
                  <div className={styles.remain_point_box}>
                    잔여 포인트 {myTeamInfo?.remain_point}
                  </div>
                  <input
                    type="number"
                    value={roomName ? (bidPrice === 0 ? "" : bidPrice) : ""}
                    readOnly={!roomName}
                    onChange={handleBidPriceChange}
                    placeholder={
                      roomName ? "포인트 입력" : "로그인 후 시도해주세요"
                    }
                    className={styles.input}
                  />
                  <button
                    onClick={sendMessage}
                    className={styles.button}
                    disabled={!isLiveMember}
                  >
                    입찰
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={styles.timer_container}
                  style={{ color: "white" }}
                >
                  <button
                    onClick={() =>
                      setBidPrice((prevBidPrice) => prevBidPrice + 10)
                    }
                  >
                    <PermIdentityOutlinedIcon />
                  </button>
                  {/* <Timer
                    className={styles.timer}
                    start={start}
                    setStart={setStart}
                    seconds={seconds}
                    setSeconds={setSeconds}
                    milliseconds={milliseconds}
                    setMilliseconds={setMilliseconds}
                  /> */}

                  <TimerComponent />

                  <button
                    onClick={() =>
                      setBidPrice((prevBidPrice) => prevBidPrice + 50)
                    }
                  >
                    사람
                  </button>
                  <div
                    className={styles.undoBtn}
                    onClick={() => {
                      setSeconds(15);
                      setMilliseconds(0);
                      setStart(false);
                    }}
                  >
                    <UndoOutlinedIcon />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuctionChat;
