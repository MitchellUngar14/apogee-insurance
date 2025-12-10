'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import QuoteStart from '@/components/QuoteStart';
import Wizard from '@/components/Wizard';
import IndividualDetailsForm from '@/components/IndividualDetailsForm';
import GroupDetailsForm from '@/components/GroupDetailsForm';
import GroupClassesForm from '@/components/GroupClassesForm';
import GroupEmployeesForm from '@/components/GroupEmployeesForm';
import ViewQuotes from '@/components/ViewQuotes';
import { useHeader } from '@/context/HeaderContext';

export default function Home() {
  const { setHeaderTitle, setShowHomeButton } = useHeader();
  const searchParams = useSearchParams();

  const [selectedQuoteType, setSelectedQuoteType] = useState<'individual' | 'group' | null>(null);
  const [showingExistingQuotes, setShowingExistingQuotes] = useState(false);

  // Check for query parameter to show quotes view
  useEffect(() => {
    if (searchParams.get('view') === 'quotes') {
      setShowingExistingQuotes(true);
    }
  }, [searchParams]);

  const handleBackToQuoteStart = () => {
    setSelectedQuoteType(null);
    setShowingExistingQuotes(false);
  };

  const handleSelectQuoteType = (type: 'individual' | 'group') => {
    setSelectedQuoteType(type);
  };

  const handleCompleteIndividualQuote = async (data: any) => {
    console.log('Individual Quote Completed:', data);
    try {
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, quoteType: 'Individual' }),
      });
      if (response.ok) {
        const newApplicant = await response.json();
        console.log('Applicant saved successfully:', newApplicant);
        alert('Individual Quote submitted successfully!');
        setSelectedQuoteType(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to save applicant:', errorData);
        alert('Failed to submit individual quote. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting individual quote:', error);
      alert('An error occurred while submitting the individual quote.');
    }
  };

  const handleCompleteGroupQuote = async (data: any) => {
    console.log('Group Quote Completed:', data);
    try {
      // Step 1: Create the group and quote
      const groupResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupName: data.groupName }),
      });

      if (!groupResponse.ok) {
        const errorData = await groupResponse.json();
        console.error('Failed to save group:', errorData);
        alert('Failed to create group. Please try again.');
        return;
      }

      const { group } = await groupResponse.json();
      console.log('Group created:', group);

      // Step 2: Create the employee classes
      const classIdMap: Record<number, number> = {}; // Maps local index to DB id
      for (let i = 0; i < data.classes.length; i++) {
        const cls = data.classes[i];
        const classResponse = await fetch('/api/employee-classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: group.id,
            className: cls.className,
            description: cls.description,
          }),
        });

        if (!classResponse.ok) {
          console.error('Failed to create class:', cls.className);
          continue;
        }

        const newClass = await classResponse.json();
        classIdMap[i] = newClass.id;
        console.log('Class created:', newClass);
      }

      // Step 3: Create the employees
      for (const employee of data.employees) {
        // Map the local classId (index) to the actual DB class id
        const dbClassId = classIdMap[employee.classId];

        const employeeResponse = await fetch('/api/applicants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: employee.firstName,
            middleName: employee.middleName || null,
            lastName: employee.lastName,
            birthdate: employee.birthdate,
            phoneNumber: employee.phoneNumber || null,
            email: employee.email || null,
            groupId: group.id,
            classId: dbClassId,
            quoteType: 'Group',
          }),
        });

        if (!employeeResponse.ok) {
          console.error('Failed to create employee:', employee);
          continue;
        }

        const newEmployee = await employeeResponse.json();
        console.log('Employee created:', newEmployee);
      }

      alert('Group Quote submitted successfully!');
      setSelectedQuoteType(null);
    } catch (error) {
      console.error('Error submitting group quote:', error);
      alert('An error occurred while submitting the group quote.');
    }
  };

  const individualQuoteSteps = [
    {
      id: 'personalDetails',
      name: 'Personal Details',
      component: <IndividualDetailsForm />,
    },
  ];

  const groupQuoteSteps = [
    {
      id: 'groupDetails',
      name: 'Group Details',
      component: <GroupDetailsForm />,
    },
    {
      id: 'employeeClasses',
      name: 'Employee Classes',
      component: <GroupClassesForm />,
    },
    {
      id: 'employees',
      name: 'Employees',
      component: <GroupEmployeesForm />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {!selectedQuoteType ? (
        !showingExistingQuotes ? (
          <QuoteStart
            onSelectQuoteType={handleSelectQuoteType}
            onViewExistingQuotes={() => setShowingExistingQuotes(true)}
          />
        ) : (
          <ViewQuotes onBack={handleBackToQuoteStart} />
        )
      ) : selectedQuoteType === 'individual' ? (
        <Wizard
          steps={individualQuoteSteps}
          onComplete={handleCompleteIndividualQuote}
          onExitWizard={handleBackToQuoteStart}
        />
      ) : (
        <Wizard
          steps={groupQuoteSteps}
          onComplete={handleCompleteGroupQuote}
          onExitWizard={handleBackToQuoteStart}
        />
      )}
    </div>
  );
}
