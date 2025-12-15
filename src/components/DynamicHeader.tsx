// src/components/DynamicHeader.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useHeader } from '@/context/HeaderContext';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import SettingsModal from '@/components/SettingsModal';

export default function DynamicHeader() {
  const { headerTitle, showHomeButton, setShowHomeButton, setHeaderTitle } = useHeader();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleGoHome = () => {
    setHeaderTitle("Apogee Insurance");
    setShowHomeButton(false);
    router.push('/');
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('dark')) {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const renderHeaderTitle = useMemo(() => {
    if (typeof headerTitle !== 'string') return headerTitle;

    const parts = headerTitle.split(/(Quoting|Customer Service|Benefit Designer)/g);
    return parts.map((part, index) => {
      if (part === "Quoting") {
        return <span key={index} style={{ color: '#22c55e' }}>{part}</span>;
      }
      if (part === "Customer Service") {
        return <span key={index} style={{ color: '#0284c7' }}>{part}</span>;
      }
      if (part === "Benefit Designer") {
        return <span key={index} style={{ color: '#FFA500' }}>{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  }, [headerTitle]);

  return (
    <>
      <div className="flex items-center justify-between w-full relative">
        <div className="z-10">
          {showHomeButton && (
            <button
              onClick={handleGoHome}
              className="px-4 py-2 text-white text-sm rounded-md hover:bg-soft-green-600 transition-colors"
              style={{ backgroundColor: '#22c55e' }}
            >
              Home
            </button>
          )}
        </div>
        <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
          {renderHeaderTitle}
        </h1>
        <div className="flex items-center gap-2 z-10">
          {session?.user && (
            <span className="text-sm text-white/80 hidden sm:inline">
              {session.user.email}
            </span>
          )}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
            style={{ backgroundColor: '#0284c7' }}
          >
            ⚙️
          </button>
        </div>
      </div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        toggleDarkMode={toggleDarkMode}
        onSignOut={handleSignOut}
      />
    </>
  );
}
