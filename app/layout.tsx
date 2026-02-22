import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import AuthProviders from "@/components/AuthProviders";
import ProfileCompleteGuard from "@/components/ProfileCompleteGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDUMC Alumni Platform",
  description: "Pandit Dindayal Upadhyay Medical College Reunion 2001 Batch",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 transition-colors duration-300`}>
        <AuthProviders>
          <ProfileCompleteGuard>
            <Navbar />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </ProfileCompleteGuard>
        </AuthProviders>
      </body>
    </html>
  );
}
