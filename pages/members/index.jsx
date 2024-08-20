import Layout from "@/components/Layout";
import MemberCard from "@/components/MemberCard";
import styles from "./Members.module.css";
import { supabase } from "@/supabase.config";

const { data } = await supabase.from("minions_member").select();

export default function index() {
  return (
    <div className={styles.container}>
      <h1>모임원 소개</h1>
      <div className={styles.cardContainer}>
        {data.map((member, index) => (
          <MemberCard key={index} member={member} />
        ))}
      </div>
    </div>
  );
}

index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
