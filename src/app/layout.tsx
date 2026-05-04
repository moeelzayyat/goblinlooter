import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { LiveChatWidget } from "@/components/chat/LiveChatWidget";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoblinLooter - Digital Setup Resources",
  description:
    "Digital setup resources, account access support, instant delivery, and clear customer help.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <SessionProvider>
          {children}
          <LiveChatWidget />
        </SessionProvider>
      </body>
    </html>
  );
}
