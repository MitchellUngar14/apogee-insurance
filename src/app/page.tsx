'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useSearchParams, useRouter } from 'next/navigation'; // Import useSearchParams and useRouter
import QuoteStart from '@/components/QuoteStart';
import Wizard from '@/components/Wizard';
import IndividualDetailsForm from '@/components/IndividualDetailsForm';
import GroupDetailsForm from '@/components/GroupDetailsForm';
import ViewQuotes from '@/components/ViewQuotes';
import IntroHome from '@/components/IntroHome';
import CustomerServicePlatform from '@/components/CustomerServicePlatform';
import BenefitDesignerPlatform from '@/components/BenefitDesignerPlatform'; // Import new component
import CreateGroupBenefitWizard from '@/components/CreateGroupBenefitWizard'; // New import
import CreateIndividualBenefitWizard from '@/components/CreateIndividualBenefitWizard'; // New import
import ViewBenefits from '@/components/ViewBenefits'; // New import
import GroupBenefitDetailsForm from '@/components/GroupBenefitDetailsForm'; // New import
import IndividualBenefitDetailsForm from '@/components/IndividualBenefitDetailsForm'; // New import
import { useHeader } from '@/context/HeaderContext'; // Import useHeader

export default function Home() {
  const { setHeaderTitle, setShowHomeButton, showHomeButton } = useHeader();
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize useRouter

  // Initialize states based on URL params on first render
  const [showIntroScreen, setShowIntroScreen] = useState(() => !searchParams.get('platform'));
  const [selectedQuoteType, setSelectedQuoteType] = useState<'individual' | 'group' | null>(null);
  const [showingExistingQuotes, setShowingExistingQuotes] = useState(() => searchParams.get('platform') === 'quoting');
  const [showCustomerServicePlatform, setShowCustomerServicePlatform] = useState(() => searchParams.get('platform') === 'customer-service');
  const [showBenefitDesignerPlatform, setShowBenefitDesignerPlatform] = useState(() => searchParams.get('platform') === 'benefit-designer');
  const [showCreateGroupBenefitWizard, setShowCreateGroupBenefitWizard] = useState(false);
  const [showCreateIndividualBenefitWizard, setShowCreateIndividualBenefitWizard] = useState(false);
  const [showViewBenefits, setShowViewBenefits] = useState(false);

  useEffect(() => {
    const platform = searchParams.get('platform');
    if (platform === 'customer-service') {
      setHeaderTitle("Apogee Insurance Customer Service");
      setShowHomeButton(true);
    } else if (platform === 'quoting') {
      setHeaderTitle("Apogee Insurance Quoting");
      setShowHomeButton(true);
    } else if (platform === 'benefit-designer') {
      setHeaderTitle("Apogee Insurance Benefit Designer");
      setShowHomeButton(true);
    } else {
      setHeaderTitle("Apogee Insurance");
      setShowHomeButton(false);
    }
  }, [searchParams, setHeaderTitle, setShowHomeButton]);

  // This useEffect remains to handle when the DynamicHeader's Home button is clicked
  useEffect(() => {
    if (!showHomeButton && !showIntroScreen) {
      setShowIntroScreen(true);
      setHeaderTitle("Apogee Insurance");
    }
  }, [showHomeButton, showIntroScreen, setHeaderTitle]);

  const handleGoToQuotingPlatform = () => {
    setShowIntroScreen(false);
    setShowCustomerServicePlatform(false); // Ensure other platforms are hidden
    setShowBenefitDesignerPlatform(false); // Ensure other platforms are hidden
    setShowCreateGroupBenefitWizard(false);
    setShowCreateIndividualBenefitWizard(false);
    setShowViewBenefits(false);
    setHeaderTitle("Apogee Insurance Quoting");
    setShowHomeButton(true);
  };

  const handleGoToCustomerServicePlatform = () => { // New handler
    setShowIntroScreen(false);
    setSelectedQuoteType(null); // Ensure other platforms are hidden
    setShowingExistingQuotes(false); // Ensure other platforms are hidden
    setShowCustomerServicePlatform(true);
    setShowBenefitDesignerPlatform(false); // Ensure other platforms are hidden
    setShowCreateGroupBenefitWizard(false);
    setShowCreateIndividualBenefitWizard(false);
    setShowViewBenefits(false);
    setHeaderTitle("Apogee Insurance Customer Service");
    setShowHomeButton(true);
  };

  const handleGoToBenefitDesignerPlatform = () => { // New handler
    setShowIntroScreen(false);
    setSelectedQuoteType(null); // Ensure other platforms are hidden
    setShowingExistingQuotes(false); // Ensure other platforms are hidden
    setShowCustomerServicePlatform(false); // Ensure other platforms are hidden
    setShowBenefitDesignerPlatform(true);
    setHeaderTitle("Apogee Insurance Benefit Designer");
    setShowHomeButton(true);
  };

  const handleBackToIntro = () => {
    setShowIntroScreen(true);
    setSelectedQuoteType(null);
    setShowingExistingQuotes(false);
    setShowCustomerServicePlatform(false);
    setShowBenefitDesignerPlatform(false); // Reset new state
    setShowCreateGroupBenefitWizard(false);
    setShowCreateIndividualBenefitWizard(false);
    setShowViewBenefits(false);
    setHeaderTitle("Apogee Insurance");
    setShowHomeButton(false);
    router.push('/'); // Navigate to base URL to clear query params
  };

  const handleBackToQuotingPlatformHome = () => { // Only stop showing existing quotes
    setShowingExistingQuotes(false);
  };

  const handleBackToQuoteStart = () => { // New handler for Wizard's onExitWizard
    setSelectedQuoteType(null); // Stop showing the wizard and return to QuoteStart
  };

  const handleBackToBenefitDesignerPlatformHome = () => {
    setShowCreateGroupBenefitWizard(false);
    setShowCreateIndividualBenefitWizard(false);
    setShowViewBenefits(false);
  };

  const handleCreateGroupBenefit = () => {
    setShowCreateGroupBenefitWizard(true);
    setShowCreateIndividualBenefitWizard(false);
    setShowViewBenefits(false);
  };

  const handleCreateIndividualBenefit = () => {
    setShowCreateIndividualBenefitWizard(true);
    setShowCreateGroupBenefitWizard(false);
    setShowViewBenefits(false);
  };

  const handleViewBenefits = () => {
    setShowViewBenefits(true);
    setShowCreateGroupBenefitWizard(false);
    setShowCreateIndividualBenefitWizard(false);
  };

  const handleCompleteGroupBenefit = (data: any) => {
    console.log("Completed Group Benefit:", data);
    alert("Group Benefit created successfully!");
    handleBackToBenefitDesignerPlatformHome();
  };

  const handleCompleteIndividualBenefit = (data: any) => {
    console.log("Completed Individual Benefit:", data);
    alert("Individual Benefit created successfully!");
    handleBackToBenefitDesignerPlatformHome();
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
        body: JSON.stringify({ ...data, quoteType: 'Individual' }), // Add quoteType
      });
      if (response.ok) {
        const newApplicant = await response.json();
        console.log('Applicant saved successfully:', newApplicant);
        alert('Individual Quote submitted successfully!');
        setSelectedQuoteType(null); // Reset wizard
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
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const newGroup = await response.json();
        console.log('Group saved successfully:', newGroup);
        alert('Group Quote submitted successfully!');
        setSelectedQuoteType(null); // Reset wizard
      } else {
        const errorData = await response.json();
        console.error('Failed to save group:', errorData);
        alert('Failed to submit group quote. Please try again.');
      }
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
    // Add more steps for individual quote as needed
  ];

  const groupQuoteSteps = [
    {
      id: 'groupDetails',
      name: 'Group Details',
      component: <GroupDetailsForm />,
    },
    // Add more steps for group quote as needed
  ];

  // Placeholder steps for Benefit Designers
  const groupBenefitSteps = [
    { id: 'groupBenefitDetails', name: 'Group Benefit Details', component: <GroupBenefitDetailsForm /> },
    { id: 'confirmGroupBenefit', name: 'Confirm Group Benefit', component: <p>Confirmation of Group Benefit</p> },
  ];

  const individualBenefitSteps = [
    { id: 'individualBenefitDetails', name: 'Individual Benefit Details', component: <IndividualBenefitDetailsForm /> },
    { id: 'confirmIndividualBenefit', name: 'Confirm Individual Benefit', component: <p>Confirmation of Individual Benefit</p> },
  ];


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {showIntroScreen ? (
        <IntroHome
          onGoToQuotingPlatform={handleGoToQuotingPlatform}
          onGoToCustomerServicePlatform={handleGoToCustomerServicePlatform}
          onGoToBenefitDesignerPlatform={handleGoToBenefitDesignerPlatform} // Pass new handler
        />
      ) : showCustomerServicePlatform ? ( // New conditional render
        <CustomerServicePlatform onBack={handleBackToIntro} />
      ) : showBenefitDesignerPlatform ? ( // New conditional render
        showCreateGroupBenefitWizard ? (
          <Wizard
            steps={groupBenefitSteps}
            onComplete={handleCompleteGroupBenefit}
            onExitWizard={handleBackToBenefitDesignerPlatformHome}
            headerColor='#FFA500'
          />
        ) : showCreateIndividualBenefitWizard ? (
          <Wizard
            steps={individualBenefitSteps}
            onComplete={handleCompleteIndividualBenefit}
            onExitWizard={handleBackToBenefitDesignerPlatformHome}
            headerColor='#FFA500'
          />
        ) : showViewBenefits ? (
          <ViewBenefits onBack={handleBackToBenefitDesignerPlatformHome} />
        ) : (
          <BenefitDesignerPlatform
            onBack={handleBackToIntro}
            onCreateGroupBenefit={handleCreateGroupBenefit}
            onCreateIndividualBenefit={handleCreateIndividualBenefit}
            onViewExistingBenefits={handleViewBenefits}
          />
        )
      ) : (
        !selectedQuoteType ? (
          !showingExistingQuotes ? (
            <>
              <QuoteStart
                onSelectQuoteType={handleSelectQuoteType}
                onViewExistingQuotes={() => setShowingExistingQuotes(true)}
              />
            </>
          ) : (
            <ViewQuotes onBack={handleBackToQuotingPlatformHome} />
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
        )
      )}
    </div>
  );
}