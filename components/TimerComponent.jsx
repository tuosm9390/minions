import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/supabase.config";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import styles from "./TimerComponent.module.css";

const TimerComponent = () => {
  const [timer, setTimer] = useState(null);

  // console.log('timer', timer)
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isRunning, setIsRunning] = useState(false);

  const getElapsedTime = useCallback(() => {
    if (timer?.start_time) {
      const startTime = new Date(timer?.start_time).getTime();
      const elapsed = currentTime - startTime;
      const result = 15 - Math.floor((elapsed / 1000) % 60);

      if (result <= 0) {
        return 15; // 0 이하일 경우 0 반환
      }

      return result;
    }
    return 0;
  }, [currentTime, timer?.start_time]);

  const handleTimerEnd = async () => {
    await supabase
      .from("timers")
      .update({ is_running: false })
      .eq("id", timer?.id);
    setIsRunning(false); // 상태 변경
  };

  const toggleTimer = async () => {
    if (isRunning) {
      await supabase
        .from("timers")
        .update({ is_running: false })
        .eq("id", timer?.id);
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
        .eq("id", timer?.id);
      setIsRunning(true); // 상태 변경
    }
  };

  const formatTime = (seconds) => {
    return `${String(seconds).padStart(2, "0")}`;
  };

  const elapsedTime = getElapsedTime();

  useEffect(() => {
    const fetchTimer = async () => {
      const { data, error } = await supabase.from("timers").select("*");

      if (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
        return;
      }

      if (data && data.length > 0) {
        setTimer(data[0]);
        setIsRunning(data[0]?.is_running);
      } else {
        console.warn("타이머 데이터가 없습니다.");
        setTimer(null); // 필요에 따라 상태를 초기화
        setIsRunning(false); // 기본값 설정
      }
    };

    fetchTimer();

    const interval = setInterval(() => {
      if (isRunning) {
        setCurrentTime(Date.now());

        if (getElapsedTime() <= 0) {
          clearInterval(interval);
          handleTimerEnd(); // 타이머 종료 처리
          return;
        }
      }
    }, 10); // 10ms 간격으로 업데이트

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      clearInterval(interval);
    };
  }, [getElapsedTime, isRunning]);

  return (
    <>
      <div className={styles.startBtn} onClick={toggleTimer}>
        {isRunning ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
      </div>
      <div className={`${styles.timerBox}`}>
        <span>COUNT {formatTime(elapsedTime)}</span>
      </div>
    </>
  );
};

export default TimerComponent;
