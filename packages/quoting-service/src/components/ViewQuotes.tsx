'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateForDisplay } from '@apogee/shared';

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
  email: string;
  groupId: number | null;
  quoteType: 'Individual' | 'Group' | null;
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

type ViewQuotesProps = {
  onBack: () => void;
};

export default function ViewQuotes({ onBack }: ViewQuotesProps) {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputSearchTerm, setInputSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [quoteTypeFilter, setQuoteTypeFilter] = useState<'all' | 'Individual' | 'Group'>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

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
  }, []);

  const performSearch = () => {
    setCurrentSearchTerm(inputSearchTerm);
    setHasSearched(true);
  };

  const clearSearch = () => {
    setInputSearchTerm('');
    setCurrentSearchTerm('');
    setHasSearched(false);
    setQuoteTypeFilter('all');
  };

  const filteredGroups = useMemo(() => {
    if (!hasSearched || !quoteData) return [];
    if (quoteTypeFilter !== 'all' && quoteTypeFilter !== 'Group') return [];

    const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
    return quoteData.groups.filter((group) =>
      group.groupName.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [quoteData, currentSearchTerm, quoteTypeFilter, hasSearched]);

  const filteredIndividualApplicants = useMemo(() => {
    if (!hasSearched || !quoteData) return [];
    if (quoteTypeFilter !== 'all' && quoteTypeFilter !== 'Individual') return [];

    const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
    return quoteData.applicants.filter(
      (applicant) =>
        applicant.quoteType === 'Individual' &&
        (applicant.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
          (applicant.middleName && applicant.middleName.toLowerCase().includes(lowerCaseSearchTerm)) ||
          applicant.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
          applicant.email.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [quoteData, currentSearchTerm, quoteTypeFilter, hasSearched]);

  const getApplicantsForGroup = (groupId: number) =>
    quoteData?.applicants.filter((app) => app.groupId === groupId) || [];

  const getQuotesForEntity = (entityId: number, type: 'Individual' | 'Group') => {
    if (!quoteData) return [];
    if (type === 'Individual') {
      return quoteData.quotes.filter((q) => q.applicantId === entityId);
    }
    return quoteData.quotes.filter((q) => q.groupId === entityId);
  };

  const handleQuoteClick = (quoteId: number) => {
    router.push(`/quotes/${quoteId}`);
  };

  const handleDeleteQuote = async (quoteId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete

    if (!confirm('Are you sure you want to delete this quote? This will also delete all associated data (applicants, employees, coverages, etc.).')) {
      return;
    }

    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the data
        setLoading(true);
        const [groupsRes, applicantsRes, quotesRes] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/applicants'),
          fetch('/api/quotes'),
        ]);

        if (groupsRes.ok && applicantsRes.ok && quotesRes.ok) {
          const groups = await groupsRes.json();
          const applicants = await applicantsRes.json();
          const quotesData = await quotesRes.json();
          setQuoteData({ groups, applicants, quotes: quotesData });
        }
        setLoading(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete quote: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('An error occurred while deleting the quote.');
    }
  };

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading existing quotes...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">Error: {error}</div>;
  }

  if (!quoteData) {
    return (
      <div className="flex flex-col items-center justify-center mt-8 p-6 bg-white shadow-lg rounded-lg">
        <p className="text-lg text-gray-700 mb-4">No quote data available.</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-soft-blue-500 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--background)] shadow-lg rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Existing Quotes Breakdown</h2>

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
        <select
          value={quoteTypeFilter}
          onChange={(e) => setQuoteTypeFilter(e.target.value as 'all' | 'Individual' | 'Group')}
          className="p-2 rounded-md shadow-sm form-label"
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
        >
          <option value="all">All</option>
          <option value="Individual">Individual</option>
          <option value="Group">Group</option>
        </select>
        <button
          onClick={performSearch}
          className="px-4 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors"
          style={{ backgroundColor: '#22c55e' }}
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

      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors"
        style={{ backgroundColor: '#22c55e' }}
      >
        ← Back
      </button>

      {!hasSearched && (
        <p className="form-label text-center mt-4">Enter a search term and click 'Search' to view results.</p>
      )}
      {hasSearched && filteredIndividualApplicants.length === 0 && filteredGroups.length === 0 && (
        <p className="form-label text-center mt-4">No matching quotes found.</p>
      )}

      {(quoteTypeFilter === 'all' || quoteTypeFilter === 'Individual') && hasSearched && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 form-label">Individual Quotes</h3>
          {filteredIndividualApplicants.length === 0 ? (
            <p className="form-label">No matching individual quotes found.</p>
          ) : (
            <ul className="space-y-4">
              {filteredIndividualApplicants.map((applicant) => {
                const quote = getQuotesForEntity(applicant.id, 'Individual')[0];
                return (
                  <li
                    key={applicant.id}
                    className="border p-4 rounded-md bg-soft-blue-50 cursor-pointer hover:bg-soft-blue-100 transition-colors dark:bg-soft-blue-900 dark:hover:bg-soft-blue-800 dark:border-soft-blue-700"
                    onClick={() => {
                      if (quote) handleQuoteClick(quote.id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium form-label">
                          {applicant.firstName} {applicant.middleName && applicant.middleName + ' '}
                          {applicant.lastName} ({applicant.email})
                        </p>
                        <div className="ml-4 mt-2">
                          <h4 className="font-semibold form-label">Quote:</h4>
                          {!quote ? (
                            <p className="text-sm form-label">No quote associated.</p>
                          ) : (
                            <p className="text-sm form-label">
                              ID: {quote.id}, Status: {quote.status}, Created: {formatDateForDisplay(quote.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      {quote && (
                        <button
                          onClick={(e) => handleDeleteQuote(quote.id, e)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {(quoteTypeFilter === 'all' || quoteTypeFilter === 'Group') && hasSearched && (
        <section>
          <h3 className="text-xl font-semibold mb-4 form-label">Group Quotes</h3>
          {filteredGroups.length === 0 ? (
            <p className="form-label">No matching group quotes found.</p>
          ) : (
            <ul className="space-y-6">
              {filteredGroups.map((group) => {
                const quote = getQuotesForEntity(group.id, 'Group')[0];
                return (
                  <li
                    key={group.id}
                    className="border p-4 rounded-md bg-soft-blue-50 cursor-pointer hover:bg-soft-blue-100 transition-colors dark:bg-soft-blue-900 dark:hover:bg-soft-blue-800 dark:border-soft-blue-700"
                    onClick={() => {
                      if (quote) handleQuoteClick(quote.id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="font-medium form-label">Group: {group.groupName}</p>
                        <div className="ml-4 mt-2">
                          <h4 className="font-semibold form-label">Quote:</h4>
                          {!quote ? (
                            <p className="text-sm form-label">No quote associated.</p>
                          ) : (
                            <p className="text-sm form-label">
                              ID: {quote.id}, Status: {quote.status}, Created: {formatDateForDisplay(quote.createdAt)}
                            </p>
                          )}
                          <h4 className="font-semibold form-label mt-3">Employees:</h4>
                          {getApplicantsForGroup(group.id).length === 0 ? (
                            <p className="text-sm form-label">No employees added.</p>
                          ) : (
                            <ul>
                              {getApplicantsForGroup(group.id).map((applicant) => (
                                <li key={applicant.id} className="text-sm form-label">
                                  {applicant.firstName} {applicant.middleName && applicant.middleName + ' '}
                                  {applicant.lastName} {applicant.email && `(${applicant.email})`}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      {quote && (
                        <button
                          onClick={(e) => handleDeleteQuote(quote.id, e)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
