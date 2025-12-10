'use client';

import React, { useState, useEffect } from 'react';
import {
  countries,
  getCountryByCode,
  getStatesProvinces,
  validatePostalCode,
  formatPostalCode,
} from '@/lib/addressData';

type IndividualDetailsFormProps = {
  initialData?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    birthdate: string;
    phoneNumber?: string;
    email: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
  };
  onNext?: (data: any) => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
};

export default function IndividualDetailsForm({
  initialData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: IndividualDetailsFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    birthdate: initialData?.birthdate || '',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    stateProvince: initialData?.stateProvince || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || '',
  });

  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [addressExpanded, setAddressExpanded] = useState(
    !(initialData?.addressLine1 || initialData?.city || initialData?.country)
  );

  useEffect(() => {
    setFormData({
      firstName: initialData?.firstName || '',
      middleName: initialData?.middleName || '',
      lastName: initialData?.lastName || '',
      birthdate: initialData?.birthdate || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      city: initialData?.city || '',
      stateProvince: initialData?.stateProvince || '',
      postalCode: initialData?.postalCode || '',
      country: initialData?.country || '',
    });
  }, [initialData]);

  // Get current country data
  const selectedCountry = getCountryByCode(formData.country);
  const statesProvinces = getStatesProvinces(formData.country);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Reset state/province when country changes
    if (name === 'country') {
      setFormData((prev) => ({
        ...prev,
        country: value,
        stateProvince: '',
        postalCode: '',
      }));
      setPostalCodeError(null);
      return;
    }

    // Validate postal code on change
    if (name === 'postalCode') {
      const formatted = formatPostalCode(formData.country, value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));

      if (formData.country && value) {
        const isValid = validatePostalCode(formData.country, value);
        if (!isValid) {
          const country = getCountryByCode(formData.country);
          setPostalCodeError(country?.postalCodeErrorMessage || 'Invalid postal code');
        } else {
          setPostalCodeError(null);
        }
      } else {
        setPostalCodeError(null);
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required personal fields
    if (!formData.firstName || !formData.lastName || !formData.birthdate || !formData.email) {
      alert('Please fill in all required fields (First Name, Last Name, Birthdate, Email).');
      return;
    }

    // Validate required address fields
    if (!formData.addressLine1 || !formData.city || !formData.country || !formData.postalCode) {
      setAddressExpanded(true);
      alert('Please fill in all required address fields (Address Line 1, City, Country, Postal Code).');
      return;
    }

    // Validate state/province if country has states
    if (statesProvinces.length > 0 && !formData.stateProvince) {
      setAddressExpanded(true);
      alert(`Please select a ${selectedCountry?.stateProvinceLabel || 'State/Province'}.`);
      return;
    }

    // Validate postal code format
    if (formData.country && formData.postalCode) {
      const isValid = validatePostalCode(formData.country, formData.postalCode);
      if (!isValid) {
        setAddressExpanded(true);
        const country = getCountryByCode(formData.country);
        alert(country?.postalCodeErrorMessage || 'Invalid postal code format.');
        return;
      }
    }

    onNext?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Information Section */}
      <h3 className="text-lg font-semibold form-label border-b pb-2">Personal Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium form-label">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          />
        </div>
        <div>
          <label htmlFor="middleName" className="block text-sm font-medium form-label">
            Middle Name (Optional)
          </label>
          <input
            type="text"
            name="middleName"
            id="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium form-label">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          />
        </div>
        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium form-label">
            Birthdate <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="birthdate"
            id="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium form-label">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium form-label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          />
        </div>
      </div>

      {/* Address Section - Collapsible */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setAddressExpanded(!addressExpanded)}
          className="w-full flex items-center justify-between text-lg font-semibold form-label border-b pb-2"
        >
          <div className="flex items-center gap-2">
            <span>Address</span>
            {!addressExpanded && (formData.addressLine1 || formData.city) && (
              <span className="font-normal text-gray-500 text-sm truncate max-w-md">
                — {[formData.addressLine1, formData.city, formData.stateProvince, formData.country].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
          <span
            className="text-gray-600 transition-transform duration-200"
            style={{ transform: addressExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ▶
          </span>
        </button>
      </div>

      {addressExpanded && (
        <>
          <div>
        <label htmlFor="country" className="block text-sm font-medium form-label">
          Country <span className="text-red-500">*</span>
        </label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
        >
          <option value="">-- Select Country --</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium form-label">
          Address Line 1 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="addressLine1"
          id="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          required
          placeholder="Street address, P.O. box"
          className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
        />
      </div>

      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium form-label">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          name="addressLine2"
          id="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          placeholder="Apartment, suite, unit, building, floor, etc."
          className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium form-label">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            id="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          />
        </div>
        <div>
          <label htmlFor="stateProvince" className="block text-sm font-medium form-label">
            {selectedCountry?.stateProvinceLabel || 'State/Province'}
            {statesProvinces.length > 0 && <span className="text-red-500"> *</span>}
          </label>
          {statesProvinces.length > 0 ? (
            <select
              id="stateProvince"
              name="stateProvince"
              value={formData.stateProvince}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
            >
              <option value="">-- Select {selectedCountry?.stateProvinceLabel || 'State/Province'} --</option>
              {statesProvinces.map((sp) => (
                <option key={sp.code} value={sp.code}>
                  {sp.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="stateProvince"
              id="stateProvince"
              value={formData.stateProvince}
              onChange={handleChange}
              placeholder={formData.country ? 'Enter state/province' : 'Select country first'}
              disabled={!formData.country}
              className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white disabled:bg-gray-100"
            />
          )}
        </div>
      </div>

      <div className="md:w-1/2">
        <label htmlFor="postalCode" className="block text-sm font-medium form-label">
          {selectedCountry?.postalCodeLabel || 'Postal Code'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="postalCode"
          id="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          required
          placeholder={selectedCountry?.postalCodePlaceholder || 'Enter postal code'}
          disabled={!formData.country}
          className={`mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white disabled:bg-gray-100 ${
            postalCodeError ? 'border-red-500' : ''
          }`}
        />
        {postalCodeError && (
          <p className="mt-1 text-sm text-red-500">{postalCodeError}</p>
        )}
      </div>
        </>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-2 text-white rounded-md hover:bg-soft-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: '#22c55e' }}
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors"
          style={{ backgroundColor: '#22c55e' }}
        >
          {isLastStep ? 'Finish' : 'Next'}
        </button>
      </div>
    </form>
  );
}
