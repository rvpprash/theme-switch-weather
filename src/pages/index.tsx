import Head from "next/head";
import ThemeToggle from "@/components/ThemeToggle";
import Weather from "@/components/Weather";
import styles from "@/styles/Home.module.css";
import { useTheme } from "@/context/ThemeContext";

export default function Home() {
  return (
    <>
      <Head>
        <title>Weather App</title>
      </Head>
      <main className={styles.main}>
        <ThemeToggle />
        <Weather />
      </main>
    </>
  );
}
