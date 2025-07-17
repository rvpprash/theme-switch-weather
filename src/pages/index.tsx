import { Geist, Geist_Mono } from "next/font/google";

import Head from "next/head";
import ThemeToggle from "@/components/ThemeToggle";
import Weather from "@/components/Weather";
import styles from "@/styles/Home.module.css";
import { useTheme } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { theme } = useTheme();
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
