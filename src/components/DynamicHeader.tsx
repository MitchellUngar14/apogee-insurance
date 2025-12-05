// src/components/DynamicHeader.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react'; // Import useState and useEffect
import { useHeader } from '@/context/HeaderContext';
import { useRouter } from 'next/navigation';
import SettingsModal from '@/components/SettingsModal'; // Import SettingsModal

export default function DynamicHeader() {
  const { headerTitle, showHomeButton, setShowHomeButton, setHeaderTitle } = useHeader();
  const router = useRouter();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // State for modal visibility

  const handleGoHome = () => {
    setHeaderTitle("Apogee Insurance");
    setShowHomeButton(false);
    router.push('/'); // Navigate to base URL to clear query params
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
    // Apply theme from localStorage on initial load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no theme saved, use system preference
      document.documentElement.classList.add('dark');
    }
  }, []);

  const renderHeaderTitle = useMemo(() => {
    // If headerTitle is already a ReactNode (e.g., set directly with JSX), render as is
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
        {showHomeButton && (
          <button
            onClick={handleGoHome}
            className="px-4 py-2 text-white text-sm rounded-md hover:bg-soft-green-600 transition-colors"
            style={{ backgroundColor: '#22c55e' }}
          >
            🏠 Home
          </button>
        )}
        <h1 className="text-2xl font-bold flex-grow text-center">
          {renderHeaderTitle}
        </h1>
        <button
          onClick={() => setIsSettingsModalOpen(true)} // Open settings modal
          className="ml-auto p-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
          style={{ backgroundColor: '#0284c7' }}
        >
          ⚙️
        </button>
      </div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        toggleDarkMode={toggleDarkMode}
      />
    </>
  );
}
