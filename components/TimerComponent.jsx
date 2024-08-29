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
    const timerUpdateChannel = supabase
      .channel("timer-update-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "timers" },
        async (payload) => {
          console.log("타이머 업데이트!", payload);
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
      timerUpdateChannel.unsubscribe();
    };
  }, [getElapsedTime, isRunning]);

  return (
    <>
      <div className={styles.startBtn} onClick={toggleTimer}>
        {isRunning ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
      </div>
      <div className={`${styles.timerBox}`}>
        <span>
          COUNT {isRunning ? formatTime(elapsedTime) : initialSeconds}
        </span>
      </div>
    </>
  );
};

export default TimerComponent;
