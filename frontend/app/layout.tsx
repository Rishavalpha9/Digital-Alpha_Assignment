import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Outfit } from "next/font/google";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rishav — Finance dashboard",
  description: "A consumer finance dashboard for transactions, spending insights, and reward redemptions.",
};

const themeBootScript = `(function(){try{var stored=localStorage.getItem("rishav-theme");var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");if(theme==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme=theme;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${fraunces.variable} antialiased`}>
        <Script id="rishav-theme-boot" strategy="beforeInteractive">
          {themeBootScript}
        </Script>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
