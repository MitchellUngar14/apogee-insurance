// src/context/HeaderContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context value
interface HeaderContextType {
  headerTitle: ReactNode;
  setHeaderTitle: (title: ReactNode) => void;
  showHomeButton: boolean;
  setShowHomeButton: (show: boolean) => void;
}

// Create the context with a default undefined value
const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

// Provider component
export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerTitle, setHeaderTitle] = useState<ReactNode>("Apogee Insurance");
  const [showHomeButton, setShowHomeButton] = useState(false); // Default to not showing home button

  return (
    <HeaderContext.Provider value={{ headerTitle, setHeaderTitle, showHomeButton, setShowHomeButton }}>
      {children}
    </HeaderContext.Provider>
  );
}

// Custom hook to use the header context
export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}
