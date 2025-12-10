'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
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
  birthdate: string;
  phoneNumber?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  groupId: number | null;
  classId?: number | null;
  quoteType: 'Individual' | 'Group' | null;
  status: 'Incomplete' | 'Complete';
  createdAt: string;
}

interface EmployeeClass {
  id: number;
  groupId: number;
  className: string;
  description?: string | null;
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
  employeeClasses: EmployeeClass[];
  coverages: Coverage[];
}

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id;

  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<Set<number | null>>(new Set());
  const [expandedEmployees, setExpandedEmployees] = useState<Set<number>>(new Set());

  const toggleClassExpanded = (classId: number | null) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const toggleEmployeeExpanded = (employeeId: number) => {
    setExpandedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  async function fetchQuoteDetails() {
    if (!quoteId) {
      setError('Quote ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
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

  useEffect(() => {
    fetchQuoteDetails();
    // Set default effective date to today
    setEffectiveDate(new Date().toISOString().split('T')[0]);
  }, [quoteId]);

  const handleConvertToPolicy = async () => {
    if (!effectiveDate) {
      alert('Please select an effective date');
      return;
    }

    setConverting(true);
    try {
      const response = await fetch('/api/convert-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: parseInt(quoteId as string),
          effectiveDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to convert quote');
      }

      const result = await response.json();
      alert(`Quote converted to policy successfully! Policy Number: ${result.policyNumber}`);
      router.push(`/policies/${result.policy.id}`);
    } catch (err) {
      console.error('Error converting quote:', err);
      alert((err as Error).message);
    } finally {
      setConverting(false);
    }
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

  const { quote, applicant, group, groupApplicants, employeeClasses = [], coverages } = quoteDetails;

  // Group employees by class
  const getEmployeesByClass = () => {
    const byClass: { classId: number | null; className: string; employees: Applicant[] }[] = [];

    // Add employees for each defined class
    employeeClasses.forEach((cls) => {
      byClass.push({
        classId: cls.id,
        className: cls.className,
        employees: groupApplicants.filter((emp) => emp.classId === cls.id),
      });
    });

    // Add any employees without a class (shouldn't happen, but handle gracefully)
    const unclassifiedEmployees = groupApplicants.filter(
      (emp) => !emp.classId || !employeeClasses.some((cls) => cls.id === emp.classId)
    );
    if (unclassifiedEmployees.length > 0) {
      byClass.push({
        classId: null,
        className: 'Unclassified',
        employees: unclassifiedEmployees,
      });
    }

    return byClass.filter((group) => group.employees.length > 0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Quote Details (ID: {quote.id})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold form-label mb-2">Quote Information</h3>
          <p className="form-label"><strong>Type:</strong> {quote.type}</p>
          <p className="form-label"><strong>Status:</strong> <span className={
            quote.status === 'Ready for Sale' ? 'text-green-600' :
            quote.status === 'Archived' ? 'text-gray-500' : 'text-blue-600'
          }>{quote.status}</span></p>
          <p className="form-label"><strong>Created:</strong> {formatDateForDisplay(quote.createdAt)}</p>
        </div>

        {quote.type === 'Individual' && applicant && (
          <div>
            <h3 className="text-xl font-semibold form-label mb-2">Applicant Details</h3>
            <p className="form-label"><strong>Name:</strong> {applicant.firstName} {applicant.middleName} {applicant.lastName}</p>
            <p className="form-label"><strong>Email:</strong> {applicant.email}</p>
            <p className="form-label"><strong>Birthdate:</strong> {formatDateForDisplay(applicant.birthdate)}</p>
            {applicant.phoneNumber && <p className="form-label"><strong>Phone:</strong> {applicant.phoneNumber}</p>}
            {applicant.addressLine1 && (
              <div className="mt-2">
                <p className="form-label"><strong>Address:</strong></p>
                <p className="form-label ml-4">{applicant.addressLine1}</p>
                {applicant.addressLine2 && <p className="form-label ml-4">{applicant.addressLine2}</p>}
                <p className="form-label ml-4">
                  {[applicant.city, applicant.stateProvince, applicant.postalCode].filter(Boolean).join(', ')}
                </p>
                {applicant.country && <p className="form-label ml-4">{applicant.country}</p>}
              </div>
            )}
          </div>
        )}

        {quote.type === 'Group' && group && (
          <div>
            <h3 className="text-xl font-semibold form-label mb-2">Group Details</h3>
            <p className="form-label"><strong>Group Name:</strong> {group.groupName}</p>
            <p className="form-label"><strong>Created:</strong> {formatDateForDisplay(group.createdAt)}</p>
          </div>
        )}
      </div>

      {quote.type === 'Group' && groupApplicants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold form-label mb-3">Group Employees ({groupApplicants.length})</h3>
          <div className="space-y-3">
            {getEmployeesByClass().map((classGroup) => (
              <div key={classGroup.classId ?? 'unclassified'} className="border rounded-lg overflow-hidden">
                {/* Class Header */}
                <button
                  type="button"
                  onClick={() => toggleClassExpanded(classGroup.classId)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="font-semibold form-label">
                    {classGroup.className} ({classGroup.employees.length})
                  </span>
                  <span
                    className="text-gray-600 dark:text-gray-300 transition-transform duration-200"
                    style={{ transform: expandedClasses.has(classGroup.classId) ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  >
                    ▶
                  </span>
                </button>

                {/* Employees List */}
                {expandedClasses.has(classGroup.classId) && (
                  <div className="divide-y">
                    {classGroup.employees.map((emp) => (
                      <div key={emp.id} className="bg-white dark:bg-gray-800">
                        {/* Employee Header */}
                        <button
                          type="button"
                          onClick={() => toggleEmployeeExpanded(emp.id)}
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="form-label">
                            {emp.firstName} {emp.middleName ? `${emp.middleName} ` : ''}{emp.lastName}
                          </span>
                          <span
                            className="text-gray-500 text-sm transition-transform duration-200"
                            style={{ transform: expandedEmployees.has(emp.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}
                          >
                            ▶
                          </span>
                        </button>

                        {/* Employee Details */}
                        {expandedEmployees.has(emp.id) && (
                          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t">
                            <div className="flex justify-between items-start">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm flex-1">
                                <p className="form-label"><strong>Birthdate:</strong> {formatDateForDisplay(emp.birthdate)}</p>
                                <p className="form-label"><strong>Status:</strong> {emp.status}</p>
                                {emp.email && <p className="form-label"><strong>Email:</strong> {emp.email}</p>}
                                {emp.phoneNumber && <p className="form-label"><strong>Phone:</strong> {emp.phoneNumber}</p>}
                              </div>
                              <button
                                type="button"
                                onClick={() => {/* TODO: Navigate to full employee view */}}
                                className="px-3 py-1 text-sm text-white rounded-md hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: '#0284c7' }}
                              >
                                View
                              </button>
                            </div>
                            {emp.addressLine1 && (
                              <div className="mt-2 text-sm">
                                <p className="form-label"><strong>Address:</strong></p>
                                <p className="form-label ml-4">{emp.addressLine1}</p>
                                {emp.addressLine2 && <p className="form-label ml-4">{emp.addressLine2}</p>}
                                <p className="form-label ml-4">
                                  {[emp.city, emp.stateProvince, emp.postalCode].filter(Boolean).join(', ')}
                                </p>
                                {emp.country && <p className="form-label ml-4">{emp.country}</p>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {coverages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold form-label">Coverages</h3>
          <ul className="list-disc list-inside ml-4 form-label">
            {coverages.map((cov) => (
              <li key={cov.id}>
                <strong>{cov.productType}</strong>: {cov.details || 'N/A'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {quote.status === 'Ready for Sale' && (
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md mb-6">
          <h3 className="text-xl font-semibold form-label mb-4">Convert to Policy</h3>
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium form-label mb-1">Effective Date:</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="p-2 rounded-md shadow-sm"
              />
            </div>
            <button
              onClick={handleConvertToPolicy}
              disabled={converting}
              className="px-6 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#22c55e' }}
            >
              {converting ? 'Converting...' : 'Convert to Policy'}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => router.push('/')}
        className="mt-6 px-6 py-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
        style={{ backgroundColor: '#0284c7' }}
      >
        ← Back to Customer Service
      </button>
    </div>
  );
}
