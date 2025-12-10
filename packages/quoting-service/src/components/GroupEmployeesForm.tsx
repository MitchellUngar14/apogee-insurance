'use client';

import React, { useState, useEffect } from 'react';
import {
  countries,
  getCountryByCode,
  getStatesProvinces,
  validatePostalCode,
  formatPostalCode,
} from '@/lib/addressData';

type EmployeeClass = {
  id?: number;
  className: string;
  description?: string;
};

type Employee = {
  id?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthdate: string;
  phoneNumber?: string;
  email?: string;
  classId?: number;
  className?: string; // For display purposes
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
};

type GroupEmployeesFormProps = {
  initialData?: {
    groupId?: number;
    groupName?: string;
    classes?: EmployeeClass[];
    employees?: Employee[];
  };
  onNext?: (data: any) => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
};

const emptyEmployee: Omit<Employee, 'id'> = {
  firstName: '',
  middleName: '',
  lastName: '',
  birthdate: '',
  phoneNumber: '',
  email: '',
  classId: undefined,
  className: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  country: '',
};

export default function GroupEmployeesForm({
  initialData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: GroupEmployeesFormProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialData?.employees || []);
  const [currentEmployee, setCurrentEmployee] = useState<Omit<Employee, 'id'>>(emptyEmployee);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [addressExpanded, setAddressExpanded] = useState(false);

  const classes = initialData?.classes || [];

  // Get current country data for the form
  const selectedCountry = getCountryByCode(currentEmployee.country || '');
  const statesProvinces = getStatesProvinces(currentEmployee.country || '');

  useEffect(() => {
    if (initialData?.employees) {
      setEmployees(initialData.employees);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'classId') {
      const selectedClass = classes.find((c, idx) => idx === parseInt(value, 10));
      setCurrentEmployee((prev) => ({
        ...prev,
        classId: parseInt(value, 10),
        className: selectedClass?.className || '',
      }));
    } else if (name === 'country') {
      // Reset state/province and postal code when country changes
      setCurrentEmployee((prev) => ({
        ...prev,
        country: value,
        stateProvince: '',
        postalCode: '',
      }));
      setPostalCodeError(null);
    } else if (name === 'postalCode') {
      const formatted = formatPostalCode(currentEmployee.country || '', value);
      setCurrentEmployee((prev) => ({ ...prev, [name]: formatted }));

      if (currentEmployee.country && value) {
        const isValid = validatePostalCode(currentEmployee.country, value);
        if (!isValid) {
          const country = getCountryByCode(currentEmployee.country);
          setPostalCodeError(country?.postalCodeErrorMessage || 'Invalid postal code');
        } else {
          setPostalCodeError(null);
        }
      } else {
        setPostalCodeError(null);
      }
    } else {
      setCurrentEmployee((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateEmployee = (): boolean => {
    if (!currentEmployee.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!currentEmployee.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!currentEmployee.birthdate) {
      setError('Birthdate is required');
      return false;
    }
    if (currentEmployee.classId === undefined) {
      setError('Please select an employee class');
      return false;
    }
    // Validate address fields
    if (!currentEmployee.country) {
      setAddressExpanded(true);
      setError('Country is required');
      return false;
    }
    if (!currentEmployee.addressLine1?.trim()) {
      setAddressExpanded(true);
      setError('Address Line 1 is required');
      return false;
    }
    if (!currentEmployee.city?.trim()) {
      setAddressExpanded(true);
      setError('City is required');
      return false;
    }
    const statesList = getStatesProvinces(currentEmployee.country);
    if (statesList.length > 0 && !currentEmployee.stateProvince) {
      setAddressExpanded(true);
      const countryData = getCountryByCode(currentEmployee.country);
      setError(`Please select a ${countryData?.stateProvinceLabel || 'State/Province'}`);
      return false;
    }
    if (!currentEmployee.postalCode?.trim()) {
      setAddressExpanded(true);
      setError('Postal code is required');
      return false;
    }
    if (currentEmployee.country && currentEmployee.postalCode) {
      const isValid = validatePostalCode(currentEmployee.country, currentEmployee.postalCode);
      if (!isValid) {
        setAddressExpanded(true);
        const country = getCountryByCode(currentEmployee.country);
        setError(country?.postalCodeErrorMessage || 'Invalid postal code format');
        return false;
      }
    }
    return true;
  };

  const handleAddEmployee = () => {
    if (!validateEmployee()) return;

    const selectedClass = classes[currentEmployee.classId!];
    const employeeWithClass = {
      ...currentEmployee,
      className: selectedClass?.className,
    };

    if (editingIndex !== null) {
      // Update existing employee
      const updated = [...employees];
      updated[editingIndex] = employeeWithClass;
      setEmployees(updated);
      setEditingIndex(null);
    } else {
      // Add new employee
      setEmployees([...employees, employeeWithClass]);
    }

    setCurrentEmployee(emptyEmployee);
    setShowForm(false);
    setError('');
    setPostalCodeError(null);
  };

  const handleEditEmployee = (index: number) => {
    const emp = employees[index];
    // Find the class index
    const classIndex = classes.findIndex((c) => c.className === emp.className);
    setCurrentEmployee({
      ...emp,
      classId: classIndex >= 0 ? classIndex : undefined,
    });
    setEditingIndex(index);
    setShowForm(true);
    // Collapse address section if employee has address data (show preview), expand if empty
    setAddressExpanded(!(emp.addressLine1 || emp.city || emp.country));
  };

  const handleRemoveEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentEmployee(emptyEmployee);
      setShowForm(false);
    }
  };

  const handleCancelEdit = () => {
    setCurrentEmployee(emptyEmployee);
    setEditingIndex(null);
    setShowForm(false);
    setError('');
    setPostalCodeError(null);
    setAddressExpanded(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (employees.length === 0) {
      setError('Please add at least one employee');
      return;
    }

    onNext?.({
      ...initialData,
      employees,
    });
  };

  // Helper to format address for display
  const formatAddressShort = (emp: Employee): string => {
    const parts: string[] = [];
    if (emp.city) parts.push(emp.city);
    if (emp.stateProvince) parts.push(emp.stateProvince);
    if (emp.country) {
      const country = getCountryByCode(emp.country);
      parts.push(country?.name || emp.country);
    }
    return parts.length > 0 ? parts.join(', ') : '';
  };

  // Group employees by class for display
  const employeesByClass = classes.map((cls) => ({
    className: cls.className,
    employees: employees.filter((emp) => emp.className === cls.className),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2 text-white">
          Employees for {initialData?.groupName || 'Group'}
        </h3>
        <p className="text-sm text-white/80 mb-4">
          Add the employees for this group quote. Each employee must be assigned to a class and provide their address.
        </p>
      </div>

      {/* Add/Edit employee form */}
      {showForm ? (
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium mb-3 text-black">
            {editingIndex !== null ? 'Edit Employee' : 'Add New Employee'}
          </h4>

          {/* Personal Information */}
          <h5 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">Personal Information</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-black">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={currentEmployee.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-black">
                Middle Name (Optional)
              </label>
              <input
                type="text"
                name="middleName"
                id="middleName"
                value={currentEmployee.middleName || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-black">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={currentEmployee.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-black">
                Birthdate <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="birthdate"
                id="birthdate"
                value={currentEmployee.birthdate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-black">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={currentEmployee.phoneNumber || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={currentEmployee.email || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="classId" className="block text-sm font-medium text-black">
                Employee Class <span className="text-red-500">*</span>
              </label>
              <select
                name="classId"
                id="classId"
                value={currentEmployee.classId ?? ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              >
                <option value="">-- Select a class --</option>
                {classes.map((cls, index) => (
                  <option key={index} value={index}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Information - Collapsible */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setAddressExpanded(!addressExpanded)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 border-b pb-1"
            >
              <div className="flex items-center gap-2">
                <span>Address</span>
                {!addressExpanded && (currentEmployee.addressLine1 || currentEmployee.city) && (
                  <span className="font-normal text-gray-500 truncate max-w-md">
                    — {[currentEmployee.addressLine1, currentEmployee.city, currentEmployee.stateProvince, currentEmployee.country].filter(Boolean).join(', ')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-black">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                name="country"
                value={currentEmployee.country || ''}
                onChange={handleInputChange}
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
            <div className="md:col-span-2">
              <label htmlFor="addressLine1" className="block text-sm font-medium text-black">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                id="addressLine1"
                value={currentEmployee.addressLine1 || ''}
                onChange={handleInputChange}
                placeholder="Street address, P.O. box"
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="addressLine2" className="block text-sm font-medium text-black">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                name="addressLine2"
                id="addressLine2"
                value={currentEmployee.addressLine2 || ''}
                onChange={handleInputChange}
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-black">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={currentEmployee.city || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
              />
            </div>
            <div>
              <label htmlFor="stateProvince" className="block text-sm font-medium text-black">
                {selectedCountry?.stateProvinceLabel || 'State/Province'}
                {statesProvinces.length > 0 && <span className="text-red-500"> *</span>}
              </label>
              {statesProvinces.length > 0 ? (
                <select
                  id="stateProvince"
                  name="stateProvince"
                  value={currentEmployee.stateProvince || ''}
                  onChange={handleInputChange}
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
                  value={currentEmployee.stateProvince || ''}
                  onChange={handleInputChange}
                  placeholder={currentEmployee.country ? 'Enter state/province' : 'Select country first'}
                  disabled={!currentEmployee.country}
                  className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white disabled:bg-gray-100"
                />
              )}
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-black">
                {selectedCountry?.postalCodeLabel || 'Postal Code'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                id="postalCode"
                value={currentEmployee.postalCode || ''}
                onChange={handleInputChange}
                placeholder={selectedCountry?.postalCodePlaceholder || 'Enter postal code'}
                disabled={!currentEmployee.country}
                className={`mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white disabled:bg-gray-100 ${
                  postalCodeError ? 'border-red-500' : ''
                }`}
              />
              {postalCodeError && (
                <p className="mt-1 text-sm text-red-500">{postalCodeError}</p>
              )}
            </div>
          </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleAddEmployee}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {editingIndex !== null ? 'Update Employee' : 'Add Employee'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          + Add Employee
        </button>
      )}

      {/* List of employees by class */}
      <div>
        <h4 className="font-medium mb-3 text-white">
          Employees ({employees.length})
        </h4>
        {employees.length === 0 ? (
          <p className="text-white/70 italic">No employees added yet. Add at least one employee to continue.</p>
        ) : (
          <div className="space-y-4">
            {employeesByClass.map((group) => (
              group.employees.length > 0 && (
                <div key={group.className} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-200 px-4 py-2 font-medium text-black">
                    {group.className} ({group.employees.length})
                  </div>
                  <ul className="divide-y">
                    {group.employees.map((emp) => {
                      const globalIndex = employees.findIndex(
                        (e) => e.firstName === emp.firstName && e.lastName === emp.lastName && e.birthdate === emp.birthdate
                      );
                      return (
                        <li
                          key={globalIndex}
                          className="flex items-center justify-between p-3 bg-white"
                        >
                          <div>
                            <span className="font-medium text-black">
                              {emp.firstName} {emp.middleName ? `${emp.middleName} ` : ''}{emp.lastName}
                            </span>
                            <span className="text-gray-600 text-sm ml-2">
                              DOB: {emp.birthdate}
                            </span>
                            {emp.email && (
                              <span className="text-gray-600 text-sm ml-2">
                                | {emp.email}
                              </span>
                            )}
                            {formatAddressShort(emp) && (
                              <span className="text-gray-500 text-sm block mt-1">
                                {formatAddressShort(emp)}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditEmployee(globalIndex)}
                              className="text-blue-500 hover:text-blue-700 px-2 py-1"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveEmployee(globalIndex)}
                              className="text-red-500 hover:text-red-700 px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
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
