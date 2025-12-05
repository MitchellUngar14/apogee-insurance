// src/components/QuoteStart.tsx
'use client';

import { useState } from 'react';

type QuoteStartProps = {
  onSelectQuoteType: (type: 'individual' | 'group') => void;
  onViewExistingQuotes: () => void; // New prop
};

export default function QuoteStart({ onSelectQuoteType, onViewExistingQuotes }: QuoteStartProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-2">
      <h2 className="text-3xl font-semibold mb-8 form-label">
        Start a New Insurance Quote
      </h2>
      <div className="flex space-x-6 mb-6"> {/* Added mb-6 for spacing below quote type buttons */}
        <button
          onClick={() => onSelectQuoteType('individual')}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:bg-soft-green-600 focus:outline-none focus:ring-2 focus:ring-soft-green-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#22c55e' }}
        >
          Individual Quote
        </button>
        <button
          onClick={() => onSelectQuoteType('group')}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:bg-soft-green-600 focus:outline-none focus:ring-2 focus:ring-soft-green-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#22c55e' }}
        >
          Group Quote
        </button>
      </div>
      {/* New location for View Existing Quotes button */}
      <button
        onClick={onViewExistingQuotes}
        className="px-6 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors"
        style={{ backgroundColor: '#22c55e' }}
      >
        View Existing Quotes
      </button>
    </div>
  );
}
