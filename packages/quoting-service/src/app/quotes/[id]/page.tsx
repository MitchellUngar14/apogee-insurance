'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import EditQuoteForm from '@/components/EditQuoteForm';
import EditApplicantForm from '@/components/EditApplicantForm';
import EditGroupForm from '@/components/EditGroupForm';
import EditGroupEmployeeForm from '@/components/EditGroupEmployeeForm';
import ViewQuoteBenefits, { QuoteBenefit } from '@/components/ViewQuoteBenefits';
import EditBenefitForm from '@/components/EditBenefitForm';
import AddBenefitFlow from '@/components/AddBenefitFlow';
import { formatDateForDisplay } from '@apogee/shared';
import { getCountryByCode } from '../../../lib/addressData';

interface Group {
  id: number;
  groupName: string;
  createdAt: string;
}

interface EmployeeClass {
  id: number;
  groupId: number;
  className: string;
  description?: string | null;
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
  quoteBenefits: QuoteBenefit[];
}

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id;

  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [employeeClasses, setEmployeeClasses] = useState<EmployeeClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuote, setEditingQuote] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Applicant | null>(null);
  const [editingBenefit, setEditingBenefit] = useState<QuoteBenefit | null>(null);
  const [addingBenefit, setAddingBenefit] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<Set<number | null>>(new Set());

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

      // If it's a group quote, fetch the employee classes
      if (data.quote.type === 'Group' && data.group?.id) {
        const classesResponse = await fetch(`/api/employee-classes?groupId=${data.group.id}`);
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setEmployeeClasses(classesData);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);

  const handleSaveQuote = async (updatedData: Partial<Quote>) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save quote changes.');
      }

      setEditingQuote(false);
      fetchQuoteDetails();
    } catch (err) {
      console.error('Error saving quote:', err);
      alert((err as Error).message);
    }
  };

  const handleSaveApplicant = async (updatedData: Partial<Applicant>) => {
    if (!quoteDetails?.applicant?.id) {
      alert('Applicant ID missing for save operation.');
      return;
    }
    try {
      const response = await fetch(`/api/applicants/${quoteDetails.applicant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save applicant changes.');
      }

      setEditingApplicant(false);
      fetchQuoteDetails();
    } catch (err) {
      console.error('Error saving applicant:', err);
      alert((err as Error).message);
    }
  };

  const handleSaveGroup = async (updatedData: Partial<Group>) => {
    if (!quoteDetails?.group?.id) {
      alert('Group ID missing for save operation.');
      return;
    }
    try {
      const response = await fetch(`/api/groups/${quoteDetails.group.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save group changes.');
      }

      setEditingGroup(false);
      fetchQuoteDetails();
    } catch (err) {
      console.error('Error saving group:', err);
      alert((err as Error).message);
    }
  };

  const handleSaveEmployee = async (updatedData: Partial<Applicant>) => {
    if (!editingEmployee?.id) {
      alert('Employee ID missing for save operation.');
      return;
    }
    try {
      const response = await fetch(`/api/applicants/${editingEmployee.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save employee changes.');
      }

      setEditingEmployee(null);
      fetchQuoteDetails();
    } catch (err) {
      console.error('Error saving employee:', err);
      alert((err as Error).message);
    }
  };

  const handleSaveBenefit = async (benefitId: number, configuredValues: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/quote-benefits/${benefitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configuredValues }),
      });

      if (!response.ok) {
        throw new Error('Failed to save benefit changes.');
      }

      setEditingBenefit(null);
      fetchQuoteDetails();
    } catch (err) {
      console.error('Error saving benefit:', err);
      alert((err as Error).message);
    }
  };

  const handleDeleteBenefit = async (benefitId: number) => {
    try {
      const response = await fetch(`/api/quote-benefits/${benefitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete benefit.');
      }

      fetchQuoteDetails();
    } catch (err) {
      console.error('Error deleting benefit:', err);
      alert((err as Error).message);
    }
  };

  const handleAddBenefit = async (benefit: {
    templateDbId: number;
    templateUuid: string;
    templateName: string;
    templateVersion: string;
    categoryName: string;
    categoryIcon: string | null;
    fieldSchema: { fields: unknown[] };
    configuredValues: Record<string, unknown>;
    instanceNumber: number;
  }) => {
    try {
      const response = await fetch('/api/quote-benefits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: Number(quoteId),
          ...benefit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add benefit.');
      }

      setAddingBenefit(false);
      fetchQuoteDetails();
    } catch (err) {
      console.error('Error adding benefit:', err);
      alert((err as Error).message);
    }
  };

  // Helper function to get class name for an employee
  const getClassName = (classId: number | null | undefined): string => {
    if (!classId) return 'Unassigned';
    const cls = employeeClasses.find((c) => c.id === classId);
    return cls?.className || 'Unknown';
  };

  // Helper function to format address for display
  const formatAddress = (app: Applicant): string | null => {
    if (!app.addressLine1 && !app.city) return null;

    const parts: string[] = [];
    if (app.addressLine1) parts.push(app.addressLine1);
    if (app.addressLine2) parts.push(app.addressLine2);

    const cityStateZip: string[] = [];
    if (app.city) cityStateZip.push(app.city);
    if (app.stateProvince) cityStateZip.push(app.stateProvince);
    if (app.postalCode) cityStateZip.push(app.postalCode);

    if (cityStateZip.length > 0) parts.push(cityStateZip.join(', '));

    if (app.country) {
      const country = getCountryByCode(app.country);
      parts.push(country?.name || app.country);
    }

    return parts.join('\n');
  };

  // Toggle expanded state for a class
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

  // Group employees by their classId
  const getEmployeesByClass = (): Map<number | null, Applicant[]> => {
    const grouped = new Map<number | null, Applicant[]>();

    if (!quoteDetails?.groupApplicants) return grouped;

    // First, add all classes from employeeClasses (even if empty)
    employeeClasses.forEach((cls) => {
      grouped.set(cls.id, []);
    });

    // Add unassigned bucket
    grouped.set(null, []);

    // Sort employees into their classes
    quoteDetails.groupApplicants.forEach((emp) => {
      const classId = emp.classId ?? null;
      if (!grouped.has(classId)) {
        grouped.set(classId, []);
      }
      grouped.get(classId)!.push(emp);
    });

    // Sort employees within each class by last name, then first name
    grouped.forEach((employees) => {
      employees.sort((a, b) => {
        const lastCompare = a.lastName.localeCompare(b.lastName);
        if (lastCompare !== 0) return lastCompare;
        return a.firstName.localeCompare(b.firstName);
      });
    });

    return grouped;
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

  const { quote, applicant, group, groupApplicants, coverages, quoteBenefits } = quoteDetails;

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

  if (editingGroup && group) {
    return (
      <EditGroupForm
        group={group}
        onSave={handleSaveGroup}
        onCancel={() => setEditingGroup(false)}
      />
    );
  }

  if (editingEmployee) {
    return (
      <EditGroupEmployeeForm
        employee={editingEmployee}
        employeeClasses={employeeClasses}
        onSave={handleSaveEmployee}
        onCancel={() => setEditingEmployee(null)}
      />
    );
  }

  if (editingBenefit) {
    return (
      <EditBenefitForm
        benefit={editingBenefit}
        onSave={handleSaveBenefit}
        onCancel={() => setEditingBenefit(null)}
      />
    );
  }

  if (addingBenefit) {
    return (
      <AddBenefitFlow
        quoteId={Number(quoteId)}
        existingBenefits={quoteBenefits || []}
        onSave={handleAddBenefit}
        onCancel={() => setAddingBenefit(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Quote Details (ID: {quote.id})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold form-label">Quote Information</h3>
            <button
              onClick={() => setEditingQuote(true)}
              className="p-1 text-white rounded-md hover:bg-soft-green-600 transition-colors"
              style={{ backgroundColor: '#22c55e' }}
            >
              Edit
            </button>
          </div>
          <p className="form-label"><strong>Type:</strong> {quote.type}</p>
          <p className="form-label"><strong>Status:</strong> {quote.status}</p>
          <p className="form-label"><strong>Created:</strong> {formatDateForDisplay(quote.createdAt)}</p>
        </div>

        {quote.type === 'Individual' && applicant && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold form-label">Applicant Details</h3>
              <button
                onClick={() => setEditingApplicant(true)}
                className="p-1 text-white rounded-md hover:bg-soft-green-600 transition-colors"
                style={{ backgroundColor: '#22c55e' }}
              >
                Edit
              </button>
            </div>
            <p className="form-label"><strong>Name:</strong> {applicant.firstName} {applicant.middleName} {applicant.lastName}</p>
            <p className="form-label"><strong>Email:</strong> {applicant.email}</p>
            <p className="form-label"><strong>Birthdate:</strong> {formatDateForDisplay(applicant.birthdate)}</p>
            {applicant.phoneNumber && <p className="form-label"><strong>Phone:</strong> {applicant.phoneNumber}</p>}
            <p className="form-label"><strong>Applicant Status:</strong> {applicant.status}</p>
            {formatAddress(applicant) && (
              <div className="mt-3">
                <p className="form-label"><strong>Address:</strong></p>
                <p className="form-label whitespace-pre-line ml-4">{formatAddress(applicant)}</p>
              </div>
            )}
          </div>
        )}

        {quote.type === 'Group' && group && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold form-label">Group Details</h3>
              <button
                onClick={() => setEditingGroup(true)}
                className="p-1 text-white rounded-md hover:bg-soft-green-600 transition-colors"
                style={{ backgroundColor: '#22c55e' }}
              >
                Edit
              </button>
            </div>
            <p className="form-label"><strong>Group Name:</strong> {group.groupName}</p>
            <p className="form-label"><strong>Created:</strong> {formatDateForDisplay(group.createdAt)}</p>
          </div>
        )}
      </div>

      {quote.type === 'Group' && groupApplicants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold form-label mb-3">Group Employees ({groupApplicants.length})</h3>
          <div className="space-y-3">
            {Array.from(getEmployeesByClass().entries())
              .filter(([, employees]) => employees.length > 0)
              .sort(([aId], [bId]) => {
                // Sort: defined classes first (by name), then unassigned at the end
                if (aId === null) return 1;
                if (bId === null) return -1;
                const aName = getClassName(aId);
                const bName = getClassName(bId);
                return aName.localeCompare(bName);
              })
              .map(([classId, employees]) => {
                const isExpanded = expandedClasses.has(classId);
                const className = getClassName(classId);

                return (
                  <div key={classId ?? 'unassigned'} className="border rounded-lg overflow-hidden">
                    {/* Class Header - Clickable */}
                    <button
                      onClick={() => toggleClassExpanded(classId)}
                      className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <span
                          className="mr-2 text-gray-600 transition-transform duration-200"
                          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >
                          ▶
                        </span>
                        <span className="font-semibold text-black">{className}</span>
                        <span className="ml-2 text-sm text-gray-600">({employees.length} employee{employees.length !== 1 ? 's' : ''})</span>
                      </div>
                    </button>

                    {/* Employees List - Collapsible */}
                    {isExpanded && (
                      <div className="divide-y">
                        {employees.map((emp) => (
                          <div
                            key={emp.id}
                            className="flex items-center justify-between p-3 bg-white"
                          >
                            <div>
                              <span className="font-medium text-black">
                                {emp.firstName} {emp.middleName && `${emp.middleName} `}{emp.lastName}
                              </span>
                              {emp.email && (
                                <span className="text-gray-600 text-sm ml-2">| {emp.email}</span>
                              )}
                              <span className="text-gray-600 text-sm ml-2">
                                | DOB: {formatDateForDisplay(emp.birthdate)}
                              </span>
                            </div>
                            <button
                              onClick={() => setEditingEmployee(emp)}
                              className="px-3 py-1 text-white text-sm rounded-md hover:bg-soft-green-600 transition-colors"
                              style={{ backgroundColor: '#22c55e' }}
                            >
                              Edit
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {quote.type === 'Group' && groupApplicants.length === 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold form-label">Group Employees</h3>
          <p className="form-label">No employees added to this group yet.</p>
        </div>
      )}

      {/* Benefits Section for Individual Quotes */}
      {quote.type === 'Individual' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold form-label">
              Configured Benefits ({quoteBenefits?.length || 0})
            </h3>
            <button
              onClick={() => setAddingBenefit(true)}
              className="px-4 py-2 text-white rounded-md hover:bg-green-600 transition-colors"
              style={{ backgroundColor: '#22c55e' }}
            >
              + Add Benefit
            </button>
          </div>
          <ViewQuoteBenefits
            benefits={quoteBenefits || []}
            onEditBenefit={(benefit) => setEditingBenefit(benefit)}
            onDeleteBenefit={handleDeleteBenefit}
          />
        </div>
      )}

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
        onClick={() => router.push('/?view=quotes')}
        className="mt-6 px-6 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors"
        style={{ backgroundColor: '#22c55e' }}
      >
        ← Back to Quotes
      </button>
    </div>
  );
}
