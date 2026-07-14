import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/react-query-provider";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import { PwaProvider } from "@/providers/pwa-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Mini Ledger",
  description: "A production-grade personal finance dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ReactQueryProvider>
          <PwaProvider>
            {children}
            <Toaster />
            <PwaRegister />
          </PwaProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
