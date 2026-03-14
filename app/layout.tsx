import type { Metadata } from "next";
import { geist, geistMono, milker } from "./fonts/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tyler Agnew",
    template: "%s — Tyler Agnew",
  },
  description: "Software engineer and musician.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${milker.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-(--color-background) text-(--color-text-primary)">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
