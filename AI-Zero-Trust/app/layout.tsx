import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import ClientWrapper from "./Clientwrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarValueAI - Predict Car Sales Prices",
  description: "Predict car sales prices with AI precision",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
