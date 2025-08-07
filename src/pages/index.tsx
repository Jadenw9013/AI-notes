import dynamic from "next/dynamic";
import styles from "../styles/Home.module.css";
const Editor = dynamic(() => import("../../components/Editor"), { ssr: false });

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.main}>
        <h1>AI Notes</h1>
        <p>Type your notes below. Use <kbd>/</kbd> for commands or shortcuts.</p>
        <Editor />
      </section>
    </div>
  );
}
