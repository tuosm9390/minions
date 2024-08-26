import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase.config";
import styles from "./AuctionChat.module.css";

const AuctionChat = ({ roomName, bidPrice, setBidPrice }) => {
  // 상태 변수
  const [chatHistory, setChatHistory] = useState([]);

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

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      chat_update_channel.unsubscribe();
    };
  }, [roomName]);

  // 메시지 전송 함수
  const sendMessage = async () => {
    if (bidPrice.trim()) {
      await supabase.from("messages").insert([
        {
          user_id: 1,
          content: "user.id 님께서 " + bidPrice + "포인트를 입찰하였습니다.",
          room_id: "4c142acb-a028-48bb-9fe8-4fba92c3fa52",
        },
      ]); // 메시지 삽입
      setBidPrice(0); // 입력 필드 초기화
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>경매 채팅</h2>
      <div className={styles.chatContainer}>
        <textarea
          rows={10}
          value={chatHistory?.map((msg) => msg.content).join("\n")}
          readOnly
          className={styles.chatHistory}
        />
        <label>입찰 금액 : </label>
        <input
          type="text"
          value={bidPrice}
          onChange={(e) => setBidPrice(e.target.value)}
          placeholder="입찰 금액 입력"
          className={styles.input}
        />
        <button onClick={sendMessage} className={styles.button}>
          전송
        </button>
      </div>
    </div>
  );
};

export default AuctionChat;
