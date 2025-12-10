'use client';

import React, { useState } from 'react';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  toggleDarkMode: () => void;
};

export default function SettingsModal({ isOpen, onClose, toggleDarkMode }: SettingsModalProps) {
  const [showAbout, setShowAbout] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 form-label">Settings</h2>

        <div className="space-y-4">
          <button
            onClick={toggleDarkMode}
            className="w-full px-4 py-2 bg-soft-blue-500 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
            style={{ backgroundColor: '#0284c7' }}
          >
            Toggle Dark Mode
          </button>

          <button
            onClick={() => alert('Signing out...')}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>

          <button
            onClick={() => setShowAbout(!showAbout)}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {showAbout ? 'Hide About' : 'About'}
          </button>

          {showAbout && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-700 dark:text-gray-300">
              <p className="form-label">
                Apogee Insurance Customer Service.
                Version: 1.0.0.
                Developed by Mitchell Ungar.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
