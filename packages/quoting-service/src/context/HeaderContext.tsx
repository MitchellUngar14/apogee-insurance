'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface HeaderContextType {
  headerTitle: ReactNode;
  setHeaderTitle: (title: ReactNode) => void;
  showHomeButton: boolean;
  setShowHomeButton: (show: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerTitle, setHeaderTitle] = useState<ReactNode>("Apogee Quoting");
  const [showHomeButton, setShowHomeButton] = useState(false);

  return (
    <HeaderContext.Provider value={{ headerTitle, setHeaderTitle, showHomeButton, setShowHomeButton }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}
