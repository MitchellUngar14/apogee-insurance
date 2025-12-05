// src/app/quotes/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

// Define interfaces for your data (should match the API response structure)
interface Group {
  id: number;
  groupName: string;
  createdAt: string;
}

interface Applicant {
  id: number;
  fullName: string;
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

interface Coverage {
  id: number;
  quoteId: number;
  productType: string;
  details: string | null;
}

interface QuoteDetails {
  quote: Quote;
  applicant: Applicant | null;
  group: Group | null;
  groupApplicants: Applicant[];
  coverages: Coverage[];
}

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = params.id;

  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) {
      setError('Quote ID is missing.');
      setLoading(false);
      return;
    }

    async function fetchQuoteDetails() {
      try {
        const response = await fetch(`/api/quotes/${quoteId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quote details.');
        }
        const data: QuoteDetails = await response.json();
        setQuoteDetails(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuoteDetails();
  }, [quoteId]);

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading quote details...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">Error: {error}</div>;
  }

  if (!quoteDetails || !quoteDetails.quote) {
    return <div className="text-center text-lg mt-8 text-gray-700">Quote not found.</div>;
  }

  const { quote, applicant, group, groupApplicants, coverages } = quoteDetails;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quote Details (ID: {quote.id})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-gray-700">Quote Information</h3>
          <p><strong>Type:</strong> {quote.type}</p>
          <p><strong>Status:</strong> {quote.status}</p>
          <p><strong>Created:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
        </div>

        {quote.type === 'Individual' && applicant && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Applicant Details</h3>
            <p><strong>Name:</strong> {applicant.fullName}</p>
            <p><strong>Email:</strong> {applicant.email}</p>
          </div>
        )}

        {quote.type === 'Group' && group && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Group Details</h3>
            <p><strong>Group Name:</strong> {group.groupName}</p>
            <p><strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {quote.type === 'Group' && groupApplicants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">Group Employees</h3>
          <ul className="list-disc list-inside ml-4 text-gray-600">
            {groupApplicants.map((emp) => (
              <li key={emp.id}>{emp.fullName} ({emp.email})</li>
            ))}
          </ul>
        </div>
      )}

      {coverages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">Coverages</h3>
          <ul className="list-disc list-inside ml-4 text-gray-600">
            {coverages.map((cov) => (
              <li key={cov.id}>
                <strong>{cov.productType}</strong>: {cov.details || 'N/A'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => window.history.back()}
        className="mt-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
      >
        ← Back to Quotes
      </button>
    </div>
  );
}
