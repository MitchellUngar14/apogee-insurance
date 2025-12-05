'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import EditQuoteForm from '@/components/EditQuoteForm'; // Import EditQuoteForm
import EditApplicantForm from '@/components/EditApplicantForm'; // Import EditApplicantForm

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
  const [editingQuote, setEditingQuote] = useState(false); // State for editing quote info
  const [editingApplicant, setEditingApplicant] = useState(false); // State for editing applicant info

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
      }
      finally {
        setLoading(false);
      }
    }

    fetchQuoteDetails();
  }, [quoteId]);

  const handleSaveQuote = (updatedData: any) => {
    console.log('Saving updated quote:', updatedData);
    // Here, you would typically call your API to save the data
    // For now, we'll just update the local state and close the editor
    setQuoteDetails((prev) => prev ? { ...prev, quote: { ...prev.quote, ...updatedData } } : null);
    setEditingQuote(false);
  };

  const handleSaveApplicant = (updatedData: any) => {
    console.log('Saving updated applicant:', updatedData);
    // Here, you would typically call your API to save the data
    // For now, we'll just update the local state and close the editor
    setQuoteDetails((prev) => prev ? { ...prev, applicant: { ...prev.applicant, ...updatedData } } : null);
    setEditingApplicant(false);
  };

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading quote details...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">Error: {error}</div>;
  }

  if (!quoteDetails || !quoteDetails.quote) {
    return <div className="text-center text-lg mt-8 form-label">Quote not found.</div>;
  }

  const { quote, applicant, group, groupApplicants, coverages } = quoteDetails;

  if (editingQuote && quote) {
    return (
      <EditQuoteForm
        quote={quote}
        onSave={handleSaveQuote}
        onCancel={() => setEditingQuote(false)}
      />
    );
  }

  if (editingApplicant && applicant) {
    return (
      <EditApplicantForm
        applicant={applicant}
        onSave={handleSaveApplicant}
        onCancel={() => setEditingApplicant(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Quote Details (ID: {quote.id})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> {/* Removed form-label here, apply to individual sections */}
        {/* Quote Information Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold form-label">Quote Information</h3>
            <button
              onClick={() => setEditingQuote(true)}
              className="p-1 text-white rounded-md hover:bg-soft-green-600 transition-colors"
              style={{ backgroundColor: '#22c55e' }}
            >
              ✏️
            </button>
          </div>
          <p className="form-label"><strong>Type:</strong> {quote.type}</p>
          <p className="form-label"><strong>Status:</strong> {quote.status}</p>
          <p className="form-label"><strong>Created:</strong> {formatDateForDisplay(quote.createdAt)}</p>
        </div>

        {/* Applicant Details Section (for Individual Quotes) */}
        {quote.type === 'Individual' && applicant && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold form-label">Applicant Details</h3>
              <button
                onClick={() => setEditingApplicant(true)}
                className="p-1 text-white rounded-md hover:bg-soft-green-600 transition-colors"
                style={{ backgroundColor: '#22c55e' }}
              >
                ✏️
              </button>
            </div>
            <p className="form-label"><strong>Name:</strong> {applicant.firstName} {applicant.middleName} {applicant.lastName}</p>
            <p className="form-label"><strong>Email:</strong> {applicant.email}</p>
            <p className="form-label"><strong>Birthdate:</strong> {formatDateForDisplay(applicant.birthdate)}</p>
            {applicant.phoneNumber && <p className="form-label"><strong>Phone:</strong> {applicant.phoneNumber}</p>}
            <p className="form-label"><strong>Applicant Status:</strong> {applicant.status}</p>
          </div>
        )}

        {/* Group Details Section (for Group Quotes) */}
        {quote.type === 'Group' && group && (
          <div>
            <h3 className="text-xl font-semibold form-label">Group Details</h3>
            <p className="form-label"><strong>Group Name:</strong> {group.groupName}</p>
            <p className="form-label"><strong>Created:</strong> {formatDateForDisplay(group.createdAt)}</p>
          </div>
        )}
      </div>

      {/* Group Employees */}
      {quote.type === 'Group' && groupApplicants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold form-label">Group Employees</h3>
          <ul className="list-disc list-inside ml-4 form-label">
            {groupApplicants.map((emp) => (
              <li key={emp.id}>{emp.firstName} {emp.middleName} {emp.lastName} ({emp.email})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Coverages */}
      {coverages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold form-label">Coverages</h3>
          <ul className="list-disc list-inside ml-4 form-label">
            {coverages.map((cov) => (
              <li key={cov.id} className="form-label">
                <strong>{cov.productType}</strong>: {cov.details || 'N/A'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => window.history.back()}
        className="mt-6 px-6 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors"
        style={{ backgroundColor: '#22c55e' }}
      >
        ← Back to Quotes
      </button>
    </div>
  );
}
