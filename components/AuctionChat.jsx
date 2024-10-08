import { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabase.config";
import styles from "./AuctionChat.module.css";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import TimerComponent from "./TimerComponent";

const AuctionChat = ({
  roomName,
  userName,
  bidPrice,
  setBidPrice,
  myTeamInfo,
  isLiveMember,
  setLiveMember,
  successfulBid,
}) => {
  // 상태 변수
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [start, setStart] = useState(false);

  const [observer, setObserver] = useState(userName == 1 && true);

  // 메시지 전송 함수
  const sendMessage = async () => {
    if (!start) {
      setBidPrice(0);
      return window.alert("경매가 진행중이지 않습니다.");
    }

    // last_bid_team_id와 myTeamInfo.id가 동일한 경우 함수 종료
    const { data: lastBidData } = await supabase
      .from("minions_member")
      .select("last_bid_team_id")
      .eq("id", isLiveMember.id)
      .single();

    console.log("myTeamInfo", myTeamInfo);
    if (lastBidData && lastBidData.last_bid_team_id === myTeamInfo.id) {
      return window.alert("현재 팀은 입찰할 수 없습니다.");
    }

    if (bidPrice > isLiveMember.point) {
      // 메세지 저장
      await supabase.from("messages").insert([
        {
          user_id: myTeamInfo.id,
          content: `${myTeamInfo.leader_member_name} 팀장 - ${isLiveMember.member_name} - ${bidPrice}포인트 입찰`,
          room_id: roomName,
          color: myTeamInfo?.team_color,
        },
      ]); // 메시지 삽입
      setBidPrice(0); // 입력 필드 초기화

      // 현재 경매인원 point 저장
      await supabase
        .from("minions_member")
        .update({
          point: bidPrice,
          last_bid_team_id: myTeamInfo.id,
        })
        .eq("id", isLiveMember.id);

      const startTime = new Date();
      await supabase
        .from("timers")
        .update({
          start_time: startTime,
          duration: 60000,
        })
        .eq("id", 3);
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

  useEffect(() => {
    // 초기 상태 설정
    setChatHistory([
      {
        content: "서버에 접속중입니다...",
        id: "connecting",
        color: "white",
      },
    ]);

    // message채널 구독
    const message_update_channel = supabase
      .channel("message-update-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setChatHistory((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    // timer 채널 구독
    const timer_update_channel = supabase
      .channel("timer-update-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "timers" },
        async (payload) => {
          console.log("타이머 업데이트!", payload);
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

      // 가져온 메시지와 "서버에 접속중입니다..." 메시지를 결합
      setChatHistory((prev) => [
        ...(data ? [...data] : []),
        {
          content: "서버에 접속중입니다...",
          id: "connecting",
          color: "white",
        },
      ]);

      // 2초 후에 "서버에 접속되었습니다" 메시지 추가
      setTimeout(() => {
        setChatHistory((prev) => {
          // 이미 "서버에 접속되었습니다" 메시지가 있는지 확인
          const hasConnectedMessage = prev.some(
            (msg) => msg.content === "서버에 접속되었습니다"
          );
          if (!hasConnectedMessage) {
            return [
              ...prev,
              {
                content: "서버에 접속되었습니다",
                id: "server-connection",
                color: "white",
              },
            ];
          }
          return prev; // 이미 메시지가 있다면 그대로 반환
        });
      }, 2000);
    };

    fetchMessages();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      message_update_channel.unsubscribe();
      timer_update_channel.unsubscribe();
    };
  }, [roomName]);

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        {roomName && (
          <>
            <div className={styles.chat_box} ref={chatContainerRef}>
              {chatHistory?.map((msg) => {
                const parts = msg.content?.split(" - "); // "-"로 분리
                const team_leader = parts[0];
                const auction_member = parts[1];
                const points = parts[2];

                return (
                  <div key={msg.id} className={styles.entry}>
                    <span
                      className={styles.team_leader_text}
                      style={{
                        color: msg.color,
                      }}
                    >
                      {team_leader}
                    </span>
                    {parts.length > 1 && (
                      <>
                        {" - "}
                        {auction_member} {" - "}
                        <span className={styles.point}>{points}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {/*
              관전자 - 다음 사람 설정, 경매 시작, 타이머일시정지, 경매 취소, 타이머
              경매자 - 타이머, 잔여포인트, 입찰포인트, 입찰버튼
            */}
            {!observer ? (
              // 경매자
              <>
                <div
                  className={styles.timer_container}
                  style={{ color: "white" }}
                >
                  {/* <Timer
                    className={styles.timer}
                    start={start}
                    setStart={setStart}
                    seconds={seconds}
                    setSeconds={setSeconds}
                    milliseconds={milliseconds}
                    setMilliseconds={setMilliseconds}
                  /> */}
                  <TimerComponent
                    className={styles.timer}
                    successfulBid={() => successfulBid()}
                    bidPrice={bidPrice}
                    observer={observer}
                    start={start}
                    setStart={setStart}
                    isLiveMember={isLiveMember}
                    roomName={roomName}
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
              // 관전자
              <>
                <div
                  className={styles.timer_container}
                  style={{ color: "white" }}
                >
                  <button onClick={() => setLiveMember()}>
                    <PermIdentityOutlinedIcon />
                  </button>
                  {/* 기존 타이머 */}
                  {/* <Timer
                    className={styles.timer}
                    start={start}
                    setStart={setStart}
                    seconds={seconds}
                    setSeconds={setSeconds}
                    milliseconds={milliseconds}
                    setMilliseconds={setMilliseconds}
                  /> */}

                  {/* 수정한 타이머 (supabase realtime 사용) */}
                  <TimerComponent
                    className={styles.timer}
                    successfulBid={() => successfulBid()}
                    bidPrice={bidPrice}
                    observer={observer}
                    start={start}
                    setStart={setStart}
                    isLiveMember={isLiveMember}
                    roomName={roomName}
                  />
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
