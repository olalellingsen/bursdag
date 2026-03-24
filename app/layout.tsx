import type { Metadata } from "next";
import { Schoolbell } from "next/font/google";
import "./globals.css";

const schoolbell = Schoolbell({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Olas bursdag",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={schoolbell.className}>
      <body className={`antialiased p-5`}>{children}</body>
    </html>
  );
}
