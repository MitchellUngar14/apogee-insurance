import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderProvider } from '@/context/HeaderContext';
import DynamicHeader from '@/components/DynamicHeader';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apogee Benefit Designer",
  description: "Apogee Insurance Benefit Designer Service",
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
        <HeaderProvider>
          <header className="text-white p-4 shadow-md" style={{ backgroundColor: '#FFA500' }}>
            <div className="container mx-auto">
              <DynamicHeader />
            </div>
          </header>
          <main className="container mx-auto p-4">
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-4 text-center text-sm mt-8">
            <p>
              &copy; {new Date().getFullYear()} Mitchell Ungar. All Rights Reserved.
            </p>
          </footer>
        </HeaderProvider>
      </body>
    </html>
  );
}
