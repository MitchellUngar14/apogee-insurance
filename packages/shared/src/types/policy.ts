// Policy types for Customer Service (converted quotes)

export type PolicyStatus = 'Active' | 'Cancelled' | 'Expired';
export type DependentType = 'Spouse' | 'Child' | 'Domestic Partner' | 'Other';

// =============================================================================
// INDIVIDUAL POLICIES
// =============================================================================

export interface IndividualPolicy {
  id: number;
  policyNumber: string;
  sourceQuoteId: number;
  status: PolicyStatus;
  effectiveDate: string;
  expirationDate?: string | null;
  createdAt: string;
}

export interface PolicyHolder {
  id: number;
  policyId: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  birthdate?: string | null;
  phoneNumber?: string | null;
  sourceApplicantId?: number | null;
  createdAt: string;
}

export interface Dependent {
  id: number;
  policyHolderId: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthdate?: string | null;
  dependentType: DependentType;
  createdAt: string;
}

export interface Beneficiary {
  id: number;
  policyHolderId: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  relationship?: string | null;
  percentage?: number | null;
  createdAt: string;
}

export interface IndividualPolicyCoverage {
  id: number;
  policyId: number;
  productType: string;
  details?: string | null;
  premium?: string | null;
  createdAt: string;
}

export interface DependentCoverage {
  id: number;
  dependentId: number;
  productType: string;
  details?: string | null;
  premium?: string | null;
  createdAt: string;
}

// =============================================================================
// GROUP POLICIES
// =============================================================================

export interface GroupPolicy {
  id: number;
  policyNumber: string;
  sourceQuoteId: number;
  sourceGroupId?: number | null;
  groupName: string;
  status: PolicyStatus;
  effectiveDate: string;
  expirationDate?: string | null;
  createdAt: string;
}

export interface PolicyClass {
  id: number;
  groupPolicyId: number;
  className: string;
  description?: string | null;
  createdAt: string;
}

export interface GroupMember {
  id: number;
  classId: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  birthdate?: string | null;
  phoneNumber?: string | null;
  sourceApplicantId?: number | null;
  createdAt: string;
}

export interface ClassCoverage {
  id: number;
  classId: number;
  productType: string;
  details?: string | null;
  premium?: string | null;
  createdAt: string;
}

// =============================================================================
// API CONTRACTS
// =============================================================================

export interface CreateIndividualPolicyRequest {
  sourceQuoteId: number;
  effectiveDate: string;
  expirationDate?: string;
}

export interface CreateGroupPolicyRequest {
  sourceQuoteId: number;
  effectiveDate: string;
  expirationDate?: string;
  classes: {
    className: string;
    description?: string;
    memberIds: number[]; // Source applicant IDs to assign to this class
    coverages: {
      productType: string;
      details?: string;
      premium?: string;
    }[];
  }[];
}

export interface UpdatePolicyRequest {
  status?: PolicyStatus;
  expirationDate?: string;
}

// Full policy detail responses
export interface IndividualPolicyDetail {
  policy: IndividualPolicy;
  policyHolder: PolicyHolder;
  dependents: (Dependent & { coverages: DependentCoverage[] })[];
  beneficiaries: Beneficiary[];
  coverages: IndividualPolicyCoverage[];
}

export interface GroupPolicyDetail {
  policy: GroupPolicy;
  classes: (PolicyClass & {
    members: GroupMember[];
    coverages: ClassCoverage[];
  })[];
}
