'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { formatDateForDisplay } from '@apogee/shared';
import EditPolicyForm from '../../../components/EditPolicyForm';
import EditPolicyHolderForm from '../../../components/EditPolicyHolderForm';

interface Policy {
  id: number;
  policyNumber: string;
  sourceQuoteId: number;
  type: 'Individual' | 'Group';
  status: 'Active' | 'Cancelled' | 'Expired';
  effectiveDate: string;
  expirationDate: string | null;
  createdAt: string;
}

interface PolicyHolder {
  id: number;
  policyId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  birthdate?: string;
  phoneNumber?: string;
  sourceApplicantId?: number;
}

interface PolicyCoverage {
  id: number;
  policyId: number;
  productType: string;
  details?: string;
  premium?: string;
}

interface PolicyDetails {
  policy: Policy;
  policyHolders: PolicyHolder[];
  policyCoverages: PolicyCoverage[];
}

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = params.id;

  const [policyDetails, setPolicyDetails] = useState<PolicyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPolicy, setEditingPolicy] = useState(false);
  const [editingHolderId, setEditingHolderId] = useState<number | null>(null);

  async function fetchPolicyDetails() {
    if (!policyId) {
      setError('Policy ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/policies/${policyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch policy details.');
      }
      const data: PolicyDetails = await response.json();
      setPolicyDetails(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPolicyDetails();
  }, [policyId]);

  const handleUpdateStatus = async (newStatus: Policy['status']) => {
    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update policy status');
      }

      fetchPolicyDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      alert((err as Error).message);
    }
  };

  const handleSavePolicy = async (updatedData: { effectiveDate: string; expirationDate: string | null }) => {
    try {
      const response = await fetch(`/api/individual-policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update policy');
      }

      setEditingPolicy(false);
      fetchPolicyDetails();
    } catch (err) {
      console.error('Error updating policy:', err);
      alert((err as Error).message);
    }
  };

  const handleSavePolicyHolder = async (holderId: number, updatedData: Partial<PolicyHolder>) => {
    try {
      const response = await fetch(`/api/policy-holders/${holderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update policy holder');
      }

      setEditingHolderId(null);
      fetchPolicyDetails();
    } catch (err) {
      console.error('Error updating policy holder:', err);
      alert((err as Error).message);
    }
  };

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading policy details...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">Error: {error}</div>;
  }

  if (!policyDetails || !policyDetails.policy) {
    return <div className="text-center text-lg mt-8 form-label">Policy not found.</div>;
  }

  const { policy, policyHolders, policyCoverages } = policyDetails;
  const isActive = policy.status === 'Active';

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Policy: {policy.policyNumber}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Policy Information Section */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          {editingPolicy ? (
            <EditPolicyForm
              policy={policy}
              onSave={handleSavePolicy}
              onCancel={() => setEditingPolicy(false)}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold form-label">Policy Information</h3>
                {isActive && (
                  <button
                    onClick={() => setEditingPolicy(true)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="form-label"><strong>Type:</strong> {policy.type}</p>
              <p className="form-label"><strong>Status:</strong> <span className={
                policy.status === 'Active' ? 'text-green-600' :
                policy.status === 'Cancelled' ? 'text-red-500' : 'text-gray-500'
              }>{policy.status}</span></p>
              <p className="form-label"><strong>Effective Date:</strong> {formatDateForDisplay(policy.effectiveDate)}</p>
              {policy.expirationDate && (
                <p className="form-label"><strong>Expiration Date:</strong> {formatDateForDisplay(policy.expirationDate)}</p>
              )}
              <p className="form-label"><strong>Source Quote ID:</strong> {policy.sourceQuoteId}</p>
              <p className="form-label"><strong>Created:</strong> {formatDateForDisplay(policy.createdAt)}</p>

              <div className="mt-4">
                <label className="block text-sm font-medium form-label mb-1">Update Status:</label>
                <select
                  value={policy.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as Policy['status'])}
                  className="p-2 rounded-md shadow-sm form-label"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                >
                  <option value="Active">Active</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Policy Holders Section */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-xl font-semibold form-label mb-4">Policy Holders ({policyHolders.length})</h3>
          {policyHolders.length === 0 ? (
            <p className="form-label">No policy holders on record.</p>
          ) : (
            <ul className="space-y-4">
              {policyHolders.map((holder) => (
                <li key={holder.id} className="border p-3 rounded-md bg-white dark:bg-gray-700">
                  {editingHolderId === holder.id ? (
                    <EditPolicyHolderForm
                      policyHolder={holder}
                      onSave={(data) => handleSavePolicyHolder(holder.id, data)}
                      onCancel={() => setEditingHolderId(null)}
                    />
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium form-label">
                          {holder.firstName} {holder.middleName} {holder.lastName}
                        </p>
                        {isActive && (
                          <button
                            onClick={() => setEditingHolderId(holder.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <p className="text-sm form-label">{holder.email}</p>
                      {holder.birthdate && (
                        <p className="text-sm form-label">DOB: {formatDateForDisplay(holder.birthdate)}</p>
                      )}
                      {holder.phoneNumber && (
                        <p className="text-sm form-label">Phone: {holder.phoneNumber}</p>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {policyCoverages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold form-label mb-2">Coverages</h3>
          <ul className="space-y-2">
            {policyCoverages.map((cov) => (
              <li key={cov.id} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="font-medium form-label">{cov.productType}</p>
                {cov.details && <p className="text-sm form-label">Details: {cov.details}</p>}
                {cov.premium && <p className="text-sm form-label">Premium: {cov.premium}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => router.push('/?view=policies')}
        className="mt-6 px-6 py-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
        style={{ backgroundColor: '#0284c7' }}
      >
        Back to Policies
      </button>
    </div>
  );
}
