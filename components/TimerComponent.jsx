import { useEffect, useState } from "react";
import { supabase } from "@/supabase.config";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import styles from "./TimerComponent.module.css";

const TimerComponent = () => {
  const [timer, setTimer] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchTimer = async () => {
      const { data } = await supabase.from("timers").select("*");
      setTimer(data[0]);
      setIsRunning(data[0]?.is_running);
    };

    fetchTimer();

    const subscription = supabase
      .channel("timers-update-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "timers" },
        (payload) => {
          setTimer(payload.new);
          setIsRunning(payload.new.is_running);
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      if (isRunning) {
        setCurrentTime(Date.now());
      }
    }, 1000); // 1초마다 현재 시간 업데이트

    // 서버에 저장한 start_time과
    // 현재 시간 current_time의 차이
    // current_time - start_time를
    // 타이머 설정시간에서 - 연산

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [isRunning]);

  const toggleTimer = async () => {
    if (isRunning) {
      await supabase
        .from("timers")
        .update({ is_running: false })
        .eq("id", timer.id);
      setIsRunning(false); // 상태 변경
    } else {
      const startTime = new Date();
      await supabase
        .from("timers")
        .update({
          start_time: startTime,
          duration: 60000,
          is_running: true,
        })
        .eq("id", timer.id);
      setIsRunning(true); // 상태 변경
    }
  };

  // TODO
  // 타이머 함수 변경
  // 서버 이용해서 start_time체크
  // 시간타입 변경 =>
  const getElapsedTime = () => {
    if (timer?.start_time) {
      const startTime = new Date(timer.start_time).getTime();
      const elapsed = currentTime - startTime;
      // 경과 시간이 duration보다 클 경우 duration을 반환하고, 초 단위로 변환
      // const limitedElapsed = Math.min(elapsed, timer.duration);
      // console.log(limitedElapsed);
      return Math.floor((elapsed / 1000) % 60);
    }
    return 0;
  };

  const [isBlinking, setIsBlinking] = useState(false);

  return (
    <>
      <div className={styles.startBtn} onClick={toggleTimer}>
        {isRunning ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
      </div>
      <div className={`${styles.timerBox} ${isBlinking ? styles.blink : ""}`}>
        <span>COUNT {15 - Math.floor(getElapsedTime())}</span>
      </div>
    </>
  );
};

export default TimerComponent;
