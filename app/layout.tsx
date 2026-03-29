import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";

import "@/components/ui/8bit/styles/retro.css";
import "./globals.css";

import { CaseProvider } from "@/lib/case-context";

const font8bit = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-8bit",
});

export const metadata: Metadata = {
  title: {
    default: "Lies, Lies, Mystery",
    template: "%s · Lies, Lies, Mystery",
  },
  description:
    "A web mystery about language, trust, and what you choose to believe.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(0.8893 0.0052 106.5041)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.1641 0.0064 285.6767)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font8bit.variable} flex min-h-screen flex-col font-sans`}
        suppressHydrationWarning
      >
        <CaseProvider>
          <div className="flex flex-1 flex-col">{children}</div>
        </CaseProvider>
      </body>
    </html>
  );
}
