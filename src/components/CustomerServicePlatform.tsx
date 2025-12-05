// src/components/CustomerServicePlatform.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useHeader } from '@/context/HeaderContext';
import { useRouter } from 'next/navigation'; // Import useRouter

// Helper function to format date consistently for display (YYYY-MM-DD)
const formatDateForDisplay = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  // Get UTC components to avoid local timezone offset
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Define interfaces for your data (should match the API response structure)
interface Group {
  id: number;
  groupName: string;
  createdAt: string;
}

interface Applicant {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthdate: string; // Or Date, depending on how it's returned by API
  phoneNumber?: string;
  email: string;
  groupId: number | null;
  quoteType: 'Individual' | 'Group' | null;
  status: 'Incomplete' | 'Complete';
  createdAt: string;
}

interface Quote {
  id: number;
  status: 'In Progress' | 'Ready for Sale' | 'Archived';
  type: 'Individual' | 'Group';
  applicantId: number | null;
  groupId: number | null;
  createdAt: string;
}

interface QuoteData {
  groups: Group[];
  applicants: Applicant[];
  quotes: Quote[];
}

type CustomerServicePlatformProps = {
  onBack: () => void;
};

export default function CustomerServicePlatform({ onBack }: CustomerServicePlatformProps) {
  const { setHeaderTitle, setShowHomeButton } = useHeader();
  const router = useRouter();

  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputSearchTerm, setInputSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsRes, applicantsRes, quotesRes] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/applicants'),
          fetch('/api/quotes'),
        ]);

        if (!groupsRes.ok || !applicantsRes.ok || !quotesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const groups = await groupsRes.json();
        const applicants = await applicantsRes.json();
        const quotesData = await quotesRes.json();

        setQuoteData({ groups, applicants, quotes: quotesData });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // No dependencies, fetches once on mount

  const performSearch = () => {
    setCurrentSearchTerm(inputSearchTerm);
    setHasSearched(true);
  };

  const clearSearch = () => {
    setInputSearchTerm('');
    setCurrentSearchTerm('');
    setHasSearched(false);
  };

  const filteredQuotesForSale = useMemo(() => {
    if (!hasSearched || !quoteData) return [];

    const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
    const readyForSaleQuotes = quoteData.quotes.filter(
      (quote) => quote.status === 'Ready for Sale'
    );

    const quotesWithCompleteApplicants = readyForSaleQuotes.filter((quote) => {
      if (quote.type === 'Individual' && quote.applicantId) {
        const applicant = quoteData.applicants.find((app) => app.id === quote.applicantId);
        return applicant && applicant.status === 'Complete' &&
               (applicant.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
                (applicant.middleName && applicant.middleName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                applicant.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
                applicant.email.toLowerCase().includes(lowerCaseSearchTerm));
      } else if (quote.type === 'Group' && quote.groupId) {
        const groupApplicants = quoteData.applicants.filter((app) => app.groupId === quote.groupId);
        const allApplicantsComplete = groupApplicants.every((app) => app.status === 'Complete');
        const group = quoteData.groups.find(g => g.id === quote.groupId);

        return allApplicantsComplete && group && group.groupName.toLowerCase().includes(lowerCaseSearchTerm);
      }
      return false;
    });

    return quotesWithCompleteApplicants;
  }, [quoteData, currentSearchTerm, hasSearched]);

  const handleQuoteClick = (quoteId: number) => {
    router.push(`/quotes/${quoteId}?from=customer-service`);
  };

  const handleBackToHome = () => {
    setHeaderTitle("Apogee Insurance");
    setShowHomeButton(false);
    onBack();
  };

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading data...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <h2 className="text-3xl font-semibold mb-8 form-label" style={{ color: '#0284c7' }}>
        Welcome to the Customer Service
      </h2>
      <p className="text-lg form-label mb-6">
        Search for quotes that are "Ready for Sale" with all applicants "Complete".
      </p>

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or group..."
          className="w-full p-2 rounded-md shadow-sm"
          value={inputSearchTerm}
          onChange={(e) => setInputSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') performSearch();
          }}
        />
        <button
          onClick={performSearch}
          className="px-4 py-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
          style={{ backgroundColor: '#0284c7' }}
        >
          Search
        </button>
        <button
          onClick={clearSearch}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>

      {!hasSearched && (
        <p className="form-label text-center mt-4">Enter a search term and click 'Search' to view results.</p>
      )}

      {hasSearched && filteredQuotesForSale.length === 0 && (
        <p className="form-label text-center mt-4">No matching quotes found.</p>
      )}

      {hasSearched && filteredQuotesForSale.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 form-label">Filtered Quotes</h3>
          <ul className="space-y-4">
            {filteredQuotesForSale.map((quote) => {
              const applicant = quoteData?.applicants.find(a => a.id === quote.applicantId);
              const group = quoteData?.groups.find(g => g.id === quote.groupId);
              const groupApplicants = quoteData?.applicants.filter(a => a.groupId === quote.groupId) || [];

              return (
                <li
                  key={quote.id}
                  className="border p-4 rounded-md bg-soft-blue-50 cursor-pointer hover:bg-soft-blue-100 transition-colors
                             dark:bg-soft-blue-900 dark:hover:bg-soft-blue-800 dark:border-soft-blue-700"
                  onClick={() => handleQuoteClick(quote.id)}
                >
                  <p className="font-medium form-label">
                    <strong>Quote ID:</strong> {quote.id} | <strong>Type:</strong> {quote.type} | <strong>Status:</strong> {quote.status}
                  </p>
                  {quote.type === 'Individual' && applicant && (
                    <p className="form-label">
                      Applicant: {applicant.firstName} {applicant.lastName} ({applicant.email})
                    </p>
                  )}
                  {quote.type === 'Group' && group && (
                    <p className="form-label">
                      Group: {group.groupName} ({groupApplicants.length} employees)
                    </p>
                  )}
                  <p className="text-sm form-label">Created: {formatDateForDisplay(quote.createdAt)}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <button
        onClick={handleBackToHome}
        className="px-6 py-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
        style={{ backgroundColor: '#0284c7' }} // soft-blue-500
      >
        ← Back to Home
      </button>

      {/* Future customer service features will go here */}
    </div>
  );
}
