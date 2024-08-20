import { useEffect, useState } from "react";
import styles from "./Time.module.css";

export default function Timer() {
  const [seconds, setSeconds] = useState(7); // 시작 시간을 15초로 설정
  const [milliseconds, setMilliseconds] = useState(0); // 밀리초 상태
  const [isBlinking, setIsBlinking] = useState(false);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!start) return; // start가 false일 때는 타이머 실행 안 함

    const timerId = setInterval(() => {
      if (milliseconds === 0) {
        if (seconds <= 0) {
          clearInterval(timerId);
          return;
        }
        setSeconds((prevTime) => prevTime - 1);
        setMilliseconds(99); // 밀리초를 99로 설정하여 다음 초 시작 시 0.01초로 시작
      } else {
        setMilliseconds((prevMillis) => prevMillis - 1);
      }
    }, 10); // 10ms 간격으로 업데이트

    return () => clearInterval(timerId); // 컴포넌트 언마운트 시 타이머 정리
  }, [start, seconds, milliseconds]);

  useEffect(() => {
    if (seconds === 5 && milliseconds === 0) {
      setIsBlinking(true); // 05:00이 되면 깜빡임 시작
    }
    // 깜빡임 종료 조건
    if (seconds === 0 && milliseconds === 0) {
      setIsBlinking(false); // 00:00이 되면 깜빡임 종료
    }
  }, [seconds, milliseconds]);

  useEffect(() => {
    let blinkInterval;
    if (isBlinking) {
      blinkInterval = setInterval(() => {
        setIsBlinking((prev) => !prev);
      }, 500);
    }

    return () => clearInterval(blinkInterval); // 깜빡임 타이머 정리
  }, [isBlinking]);

  useEffect(() => {
    // 깜빡임 상태가 변경될 때마다 확인
    if (seconds < 5 && seconds >= 0) {
      setIsBlinking(true); // 5초 미만일 때도 깜빡임 유지
    }
  }, [seconds]);

  const formatTime = (seconds, millis) => {
    return `${String(seconds).padStart(2, "0")}:${String(millis).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <>
      <div className={`${styles.timerBox} ${isBlinking ? styles.blink : ""}`}>
        <span>{formatTime(seconds, milliseconds)}</span>
      </div>
      <button type="button" onClick={() => setStart(!start)}>
        시작
      </button>
    </>
  );
}
