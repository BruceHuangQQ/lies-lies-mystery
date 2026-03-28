import type { Metadata, Viewport } from "next";
import { DM_Sans, Fira_Code } from "next/font/google";

import "./globals.css";

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Lies, Lies, Mystery",
    template: "Lies, Lies, Mystery",
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
        className={`${fontSans.variable} ${fontMono.variable} flex min-h-screen flex-col font-sans antialiased`}
        suppressHydrationWarning
      >
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
