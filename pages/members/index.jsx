import Layout from "@/components/Layout";
import MemberCard from "@/components/MemberCard";
import styles from "./Members.module.css";
import { supabase } from "@/supabase.config";
import { useRouter } from "next/router";

const { data } = await supabase.from("minions_member").select();

export default function Index() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1>모임원 소개</h1>
      <button type="button" onClick={() => router.push("/registMember")}>
        멤버 등록
      </button>
      <div className={styles.cardContainer}>
        {data.map((member, index) => (
          <MemberCard key={index} member={member} />
        ))}
      </div>
    </div>
  );
}

Index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
