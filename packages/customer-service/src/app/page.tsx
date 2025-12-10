'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomerServiceHome from '@/components/CustomerServiceHome';
import ViewQuotes from '@/components/ViewQuotes';
import ViewPolicies from '@/components/ViewPolicies';

export default function Home() {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<'home' | 'quotes' | 'policies'>('home');

  // Check for query parameter to show specific view
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'quotes') {
      setCurrentView('quotes');
    } else if (view === 'policies') {
      setCurrentView('policies');
    }
  }, [searchParams]);

  const handleBack = () => {
    setCurrentView('home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {currentView === 'home' && (
        <CustomerServiceHome
          onViewQuotes={() => setCurrentView('quotes')}
          onViewPolicies={() => setCurrentView('policies')}
        />
      )}
      {currentView === 'quotes' && (
        <ViewQuotes onBack={handleBack} />
      )}
      {currentView === 'policies' && (
        <ViewPolicies onBack={handleBack} />
      )}
    </div>
  );
}
