import Layout from "@/components/Layout";
import styles from "./registMember.module.css";
import { useState } from "react";
import { supabase } from "@/supabase.config";

export default function Index() {
  const [data, setData] = useState({
    member_name: "",
    in_game_id: "",
    tier: "",
    position: "",
  });

  const registHandle = async () => {
    const response = await supabase.from("minions_member").upsert(data);
    if (response.status === 201) {
      window.alert("등록되었습니다.");
      setData({
        member_name: "",
        in_game_id: "",
        tier: "",
        position: "",
      });
    }
  };

  return (
    <div className={styles.container}>
      <h1>모임원 등록</h1>

      <div className={styles.form_wrapper}>
        <label>이름</label>
        <input
          value={data.member_name}
          onChange={(e) => setData({ ...data, member_name: e.target.value })}
        />

        <label>아이디</label>
        <input
          value={data.in_game_id}
          onChange={(e) => setData({ ...data, in_game_id: e.target.value })}
        />

        <label>티어</label>
        <input
          value={data.tier}
          onChange={(e) => setData({ ...data, tier: e.target.value })}
        />

        <label>포지션</label>
        <select
          onChange={(e) => setData({ ...data, position: e.target.value })}
        >
          <option defaultValue value="top">탑</option>
          <option value="jg">정글</option>
          <option value="mid">미드</option>
          <option value="ad">원딜</option>
          <option value="sup">서폿</option>
        </select>
      </div>

      <button type="button" onClick={() => registHandle()}>
        등록
      </button>
    </div>
  );
}

Index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
