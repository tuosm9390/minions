import Layout from "@/components/Layout";
import React, { useState } from "react";
import TeamAuction from "./TeamAuction";
import { supabase } from "@/supabase.config";

function Index() {
  // 채팅방
  const [roomName, setRoomName] = useState("");
  const [inputValue, setInputValue] = useState("");

  // room_name을 입력받아 해당 id를 반환하는 함수
  const getRoomIdByName = async () => {
    // Supabase에서 room_name에 해당하는 방 조회
    const { data, error } = await supabase
      .from("chat_room") // 테이블 이름
      .select() // 선택할 컬럼
      .eq("room_name", `${inputValue}`); // 조건

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
    <section>
      {roomName ? (
        <TeamAuction roomName={roomName} />
      ) : (
        <div style={{padding: "50px"}}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={"입력해주세요"}
          />
          <button type="button" onClick={() => getRoomIdByName()}>
            방 입장
          </button>
        </div>
      )}
    </section>
  );
}

export default Index;

Index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
