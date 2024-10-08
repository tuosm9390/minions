import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase.config";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import styles from "./TimerComponent.module.css";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

const TimerComponent = ({
  successfulBid,
  bidPrice,
  observer,
  start,
  setStart,
  isLiveMember,
  roomName,
}) => {
  const [timer, setTimer] = useState(null);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isRunning, setIsRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(15);

  const getElapsedTime = useCallback(() => {
    if (timer?.start_time) {
      const startTime = new Date(timer?.start_time).getTime();
      const elapsed = currentTime - startTime;
      const result = 16 - Math.floor((elapsed / 1000) % 60);

      if (result <= 0) {
        return 16; // 0 이하일 경우 0 반환
      }

      return Math.max(result, 0); // 0 이하일 경우 0 반환
    }
    return 15;
  }, [currentTime, timer?.start_time]);

  // 경매시간 마감
  const handleTimerEnd = async () => {
    await supabase
      .from("timers")
      .update({
        is_running: false,
      })
      .eq("id", timer?.id);

    // 경매 정보 저장
    await supabase
      .from("minions_member")
      .update({
        // 유찰여부
        dismissed: isLiveMember.point == 0 ? true : false,
        isLive: false,
      })
      .eq("id", isLiveMember.id);

    await supabase.from("messages").insert([
      {
        content: "경매가 종료되었습니다!",
        room_id: roomName,
        color: "",
      },
    ]); // 메시지 삽입

    setIsRunning(false); // 상태 변경
  };

  const toggleTimer = async () => {
    // 경매 취소했을 경우
    if (isRunning) {
      await supabase
        .from("timers")
        .update({ is_running: false })
        .eq("id", timer?.id);

      // 멤버 정보 변경
      await supabase
        .from("minions_member")
        .update({ point: 0, last_bid_team_id: null })
        .eq("id", isLiveMember.id);

      // 경매종료 메세지
      await supabase.from("messages").insert([
        {
          content: "경매가 종료되었습니다!",
          room_id: roomName,
          color: "white",
        },
      ]); // 메시지 삽입
    } else {
      const startTime = new Date();
      await supabase
        .from("timers")
        .update({
          start_time: startTime,
          duration: 60000,
          is_running: true,
        })
        .eq("id", timer?.id);

      await supabase.from("messages").insert([
        {
          content: "경매가 시작되었습니다!",
          room_id: roomName,
          color: "white",
        },
      ]); // 메시지 삽입
    }
    setIsRunning(!isRunning); // 상태 변경
  };

  const formatTime = (seconds) => {
    return `${String(seconds).padStart(2, "0")}`;
  };

  const elapsedTime = getElapsedTime() - 1;

  useEffect(() => {
    const fetchTimer = async () => {
      const { data, error } = await supabase
        .from("timers")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
        return;
      }

      if (data) {
        setTimer(data);
        setIsRunning(data?.is_running);
      } else {
        console.warn("타이머 데이터가 없습니다.");
        setTimer(null);
        setIsRunning(false);
      }
    };

    fetchTimer();

    const interval = setInterval(() => {
      if (isRunning) {
        setCurrentTime(Date.now());
        // getElapsedTime() 15 ~ 1로 표시되기때문에 -1값을 주어서 0이 되었을 경우 타이머 정지
        // getElapsedTime() <= 1 로 할경우 0초에서 바로 초기화
        // console.log("getElapsedTime()", getElapsedTime());
        if (getElapsedTime() - 1 <= 0) {
          clearInterval(interval);
          handleTimerEnd(); // 타이머 종료 처리
        }
      }
    }, 300);

    // Supabase 채널 구독
    const timer_update_channel = supabase
      .channel("timer-update-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "timers" },
        async (payload) => {
          // console.log("타이머 업데이트!", payload);
          const updatedTimer = await supabase
            .from("timers")
            .select("*")
            .eq("id", payload.new.id)
            .maybeSingle();
          setTimer(updatedTimer.data);
          setIsRunning(updatedTimer.data.is_running);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      timer_update_channel.unsubscribe();
    };
  }, [getElapsedTime, isRunning]);

  useMemo(() => {
    setStart(isRunning);
  }, [isRunning, setStart]);

  return observer ? (
    <>
      <div
        className={styles.startBtn}
        onClick={() => !isRunning && toggleTimer()}
      >
        {isRunning ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
      </div>
      <div className={`${styles.timerBox}`}>
        <span>
          COUNT {isRunning ? formatTime(elapsedTime) : initialSeconds}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          isRunning && successfulBid();
        }}
      >
        낙찰
      </button>
      <button
        type="button"
        className={styles.undoBtn}
        onClick={() => isRunning && toggleTimer()}
      >
        <UndoOutlinedIcon />
      </button>
    </>
  ) : (
    <div className={`${styles.timerBox}`}>
      <span>COUNT {isRunning ? formatTime(elapsedTime) : initialSeconds}</span>
    </div>
  );
};

export default TimerComponent;
