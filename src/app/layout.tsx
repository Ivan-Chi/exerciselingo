import type { Metadata } from "next";
import "./globals.css";
import { Chelsea_Market, Farro } from "next/font/google";
import InitializeApp from '@/app/InitializeApp';
import styles from "./page.module.css";
import NavSidebar from "./components/NavSidebar";
import AppHeader from './components/AppHeader';


const chelsea_Market = Chelsea_Market({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-chelsea-market",
});

const farro = Farro({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-farro",
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const header = await AppHeader();

  return (
    <html lang="en">
      <body className={`${chelsea_Market.variable} ${farro.variable}`}>
        <InitializeApp>
          <div className={styles.page}>
            <NavSidebar></NavSidebar>
            <div className={styles.hero}>
              {header}
              {children}
            </div>
          </div>
        </InitializeApp>
      </body>
    </html>
  );
}