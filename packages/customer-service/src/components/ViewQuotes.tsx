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
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Progress' | 'Ready for Sale' | 'Archived'>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/quotes');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setQuoteData(data);
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
    setStatusFilter('all');
  };

  const filteredGroups = useMemo(() => {
    if (!hasSearched || !quoteData) return [];
    if (quoteTypeFilter !== 'all' && quoteTypeFilter !== 'Group') return [];

    const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
    return quoteData.groups.filter((group) => {
      const matchesSearch = group.groupName.toLowerCase().includes(lowerCaseSearchTerm);
      const groupQuotes = quoteData.quotes.filter(q => q.groupId === group.id);
      const matchesStatus = statusFilter === 'all' || groupQuotes.some(q => q.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [quoteData, currentSearchTerm, quoteTypeFilter, statusFilter, hasSearched]);

  const filteredIndividualApplicants = useMemo(() => {
    if (!hasSearched || !quoteData) return [];
    if (quoteTypeFilter !== 'all' && quoteTypeFilter !== 'Individual') return [];

    const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
    return quoteData.applicants.filter((applicant) => {
      const matchesSearch = applicant.quoteType === 'Individual' &&
        (applicant.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
          (applicant.middleName && applicant.middleName.toLowerCase().includes(lowerCaseSearchTerm)) ||
          applicant.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
          applicant.email.toLowerCase().includes(lowerCaseSearchTerm));

      const applicantQuotes = quoteData.quotes.filter(q => q.applicantId === applicant.id);
      const matchesStatus = statusFilter === 'all' || applicantQuotes.some(q => q.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [quoteData, currentSearchTerm, quoteTypeFilter, statusFilter, hasSearched]);

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

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading quotes from Quoting Service...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--background)] shadow-lg rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Search Quotes</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or group..."
          className="flex-1 min-w-[200px] p-2 rounded-md shadow-sm"
          value={inputSearchTerm}
          onChange={(e) => setInputSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') performSearch();
          }}
        />
        <select
          value={quoteTypeFilter}
          onChange={(e) => setQuoteTypeFilter(e.target.value as any)}
          className="p-2 rounded-md shadow-sm form-label"
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
        >
          <option value="all">All Types</option>
          <option value="Individual">Individual</option>
          <option value="Group">Group</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="p-2 rounded-md shadow-sm form-label"
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
        >
          <option value="all">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Ready for Sale">Ready for Sale</option>
          <option value="Archived">Archived</option>
        </select>
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

      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
        style={{ backgroundColor: '#0284c7' }}
      >
        ← Back
      </button>

      {!hasSearched && (
        <p className="form-label text-center mt-4">Enter a search term and click 'Search' to view results.</p>
      )}
      {hasSearched && filteredIndividualApplicants.length === 0 && filteredGroups.length === 0 && (
        <p className="form-label text-center mt-4">No matching quotes found.</p>
      )}

      {(quoteTypeFilter === 'all' || quoteTypeFilter === 'Individual') && hasSearched && filteredIndividualApplicants.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 form-label">Individual Quotes</h3>
          <ul className="space-y-4">
            {filteredIndividualApplicants.map((applicant) => (
              <li
                key={applicant.id}
                className="border p-4 rounded-md bg-soft-blue-50 cursor-pointer hover:bg-soft-blue-100 transition-colors dark:bg-soft-blue-900 dark:hover:bg-soft-blue-800"
                onClick={() => {
                  const quote = getQuotesForEntity(applicant.id, 'Individual')[0];
                  if (quote) handleQuoteClick(quote.id);
                }}
              >
                <p className="font-medium form-label">
                  {applicant.firstName} {applicant.middleName && applicant.middleName + ' '}
                  {applicant.lastName} ({applicant.email})
                </p>
                <div className="ml-4 mt-2">
                  {getQuotesForEntity(applicant.id, 'Individual').map(quote => (
                    <p key={quote.id} className="text-sm form-label">
                      ID: {quote.id}, Status: <span className={
                        quote.status === 'Ready for Sale' ? 'text-green-600' :
                        quote.status === 'Archived' ? 'text-gray-500' : 'text-blue-600'
                      }>{quote.status}</span>, Created: {formatDateForDisplay(quote.createdAt)}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(quoteTypeFilter === 'all' || quoteTypeFilter === 'Group') && hasSearched && filteredGroups.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 form-label">Group Quotes</h3>
          <ul className="space-y-6">
            {filteredGroups.map((group) => (
              <li
                key={group.id}
                className="border p-4 rounded-md bg-soft-blue-50 cursor-pointer hover:bg-soft-blue-100 transition-colors dark:bg-soft-blue-900 dark:hover:bg-soft-blue-800"
                onClick={() => {
                  const quote = getQuotesForEntity(group.id, 'Group')[0];
                  if (quote) handleQuoteClick(quote.id);
                }}
              >
                <p className="font-medium form-label">Group: {group.groupName}</p>
                <div className="ml-4 mt-2">
                  {getQuotesForEntity(group.id, 'Group').map(quote => (
                    <p key={quote.id} className="text-sm form-label">
                      ID: {quote.id}, Status: <span className={
                        quote.status === 'Ready for Sale' ? 'text-green-600' :
                        quote.status === 'Archived' ? 'text-gray-500' : 'text-blue-600'
                      }>{quote.status}</span>, Created: {formatDateForDisplay(quote.createdAt)}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
