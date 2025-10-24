import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/providers/SessionProvider";
import AppLayoutWrapper from "../components/layout/AppLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YOTT!",
  description: "Ye Olde Tongue Twister",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SessionProvider  
            refetchInterval={60}
            refetchOnWindowFocus={typeof navigator !== "undefined" && navigator.onLine}
            refetchWhenOffline={false}
          >
            <AppLayoutWrapper>
              {children}
            </AppLayoutWrapper>
          </SessionProvider>
        </body>
      </html>
  );
}
