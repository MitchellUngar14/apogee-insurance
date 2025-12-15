'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useHeader } from '@/context/HeaderContext';
import SettingsModal from '@/components/SettingsModal';

export default function DynamicHeader() {
  const { headerTitle, showHomeButton, setShowHomeButton, setHeaderTitle } = useHeader();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL;

  const handleGoHome = () => {
    setHeaderTitle("Apogee Quoting");
    setShowHomeButton(false);
  };

  const handleSignOut = () => {
    // Clear the service token cookie
    document.cookie = 'service_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Redirect to portal
    window.location.href = PORTAL_URL || '/';
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

    const parts = headerTitle.split(/(Quoting)/g);
    return parts.map((part, index) => {
      if (part === "Quoting") {
        return <span key={index} className="text-white">{part}</span>;
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
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="z-10 p-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
          style={{ backgroundColor: '#0284c7' }}
        >
          ⚙️
        </button>
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
