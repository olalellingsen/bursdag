import type { Metadata } from "next";
import { Schoolbell } from "next/font/google";
import "./globals.css";
import { User } from "lucide-react";
import UserFooter from "@/components/user-footer";

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
      <body className={`antialiased`}>
        <main className="p-4 py-10">{children}</main>
      </body>
    </html>
  );
}
