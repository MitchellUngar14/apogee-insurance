'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateForDisplay } from '@apogee/shared';

interface Policy {
  id: number;
  policyNumber: string;
  sourceQuoteId: number;
  type: 'Individual' | 'Group';
  status: 'Active' | 'Cancelled' | 'Expired';
  effectiveDate: string;
  expirationDate: string | null;
  createdAt: string;
  displayName: string; // Group name or individual holder name
}

type ViewPoliciesProps = {
  onBack: () => void;
};

export default function ViewPolicies({ onBack }: ViewPoliciesProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputSearchTerm, setInputSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Cancelled' | 'Expired'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Individual' | 'Group'>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch('/api/policies');
        if (!response.ok) {
          throw new Error('Failed to fetch policies');
        }
        const data = await response.json();
        setPolicies(data.policies || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicies();
  }, []);

  const performSearch = () => {
    setCurrentSearchTerm(inputSearchTerm);
    setHasSearched(true);
  };

  const clearSearch = () => {
    setInputSearchTerm('');
    setCurrentSearchTerm('');
    setHasSearched(false);
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const filteredPolicies = useMemo(() => {
    if (!hasSearched) return [];

    const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
    return policies.filter((policy) => {
      // Search by display name (group name or individual name) or policy number
      const matchesSearch =
        policy.displayName.toLowerCase().includes(lowerCaseSearchTerm) ||
        policy.policyNumber.toLowerCase().includes(lowerCaseSearchTerm);
      const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
      const matchesType = typeFilter === 'all' || policy.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [policies, currentSearchTerm, statusFilter, typeFilter, hasSearched]);

  // Separate policies by type for display when typeFilter is 'all'
  const individualPolicies = useMemo(() =>
    filteredPolicies.filter((p) => p.type === 'Individual'),
    [filteredPolicies]
  );

  const groupPolicies = useMemo(() =>
    filteredPolicies.filter((p) => p.type === 'Group'),
    [filteredPolicies]
  );

  const handlePolicyClick = (policyId: number) => {
    router.push(`/policies/${policyId}`);
  };

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading policies...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--background)] shadow-lg rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Search Policies</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or policy number..."
          className="flex-1 min-w-[200px] p-2 rounded-md shadow-sm"
          value={inputSearchTerm}
          onChange={(e) => setInputSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') performSearch();
          }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
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
          <option value="Active">Active</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Expired">Expired</option>
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
      {hasSearched && filteredPolicies.length === 0 && (
        <p className="form-label text-center mt-4">No matching policies found.</p>
      )}

      {hasSearched && filteredPolicies.length > 0 && typeFilter === 'all' && (
        <div className="space-y-6">
          {/* Individual Policies Section */}
          {individualPolicies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold form-label mb-3 border-b pb-2">
                Individual Policies ({individualPolicies.length})
              </h3>
              <ul className="space-y-3">
                {individualPolicies.map((policy) => (
                  <li
                    key={policy.id}
                    className="border p-4 rounded-md bg-soft-blue-50 cursor-pointer hover:bg-soft-blue-100 transition-colors dark:bg-soft-blue-900 dark:hover:bg-soft-blue-800"
                    onClick={() => handlePolicyClick(policy.id)}
                  >
                    <p className="font-medium form-label">{policy.displayName}</p>
                    <div className="ml-4 mt-2 text-sm form-label">
                      <p>Policy #: {policy.policyNumber}</p>
                      <p>Status: <span className={
                        policy.status === 'Active' ? 'text-green-600' :
                        policy.status === 'Cancelled' ? 'text-red-500' : 'text-gray-500'
                      }>{policy.status}</span></p>
                      <p>Effective: {formatDateForDisplay(policy.effectiveDate)}</p>
                      {policy.expirationDate && (
                        <p>Expires: {formatDateForDisplay(policy.expirationDate)}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Group Policies Section */}
          {groupPolicies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold form-label mb-3 border-b pb-2">
                Group Policies ({groupPolicies.length})
              </h3>
              <ul className="space-y-3">
                {groupPolicies.map((policy) => (
                  <li
                    key={policy.id}
                    className="border p-4 rounded-md bg-soft-blue-50 cursor-pointer hover:bg-soft-blue-100 transition-colors dark:bg-soft-blue-900 dark:hover:bg-soft-blue-800"
                    onClick={() => handlePolicyClick(policy.id)}
                  >
                    <p className="font-medium form-label">{policy.displayName}</p>
                    <div className="ml-4 mt-2 text-sm form-label">
                      <p>Policy #: {policy.policyNumber}</p>
                      <p>Status: <span className={
                        policy.status === 'Active' ? 'text-green-600' :
                        policy.status === 'Cancelled' ? 'text-red-500' : 'text-gray-500'
                      }>{policy.status}</span></p>
                      <p>Effective: {formatDateForDisplay(policy.effectiveDate)}</p>
                      {policy.expirationDate && (
                        <p>Expires: {formatDateForDisplay(policy.expirationDate)}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Single type filtered results */}
      {hasSearched && filteredPolicies.length > 0 && typeFilter !== 'all' && (
        <ul className="space-y-4">
          {filteredPolicies.map((policy) => (
            <li
              key={policy.id}
              className="border p-4 rounded-md bg-soft-blue-50 cursor-pointer hover:bg-soft-blue-100 transition-colors dark:bg-soft-blue-900 dark:hover:bg-soft-blue-800"
              onClick={() => handlePolicyClick(policy.id)}
            >
              <p className="font-medium form-label">{policy.displayName}</p>
              <div className="ml-4 mt-2 text-sm form-label">
                <p>Policy #: {policy.policyNumber}</p>
                <p>Status: <span className={
                  policy.status === 'Active' ? 'text-green-600' :
                  policy.status === 'Cancelled' ? 'text-red-500' : 'text-gray-500'
                }>{policy.status}</span></p>
                <p>Effective: {formatDateForDisplay(policy.effectiveDate)}</p>
                {policy.expirationDate && (
                  <p>Expires: {formatDateForDisplay(policy.expirationDate)}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
