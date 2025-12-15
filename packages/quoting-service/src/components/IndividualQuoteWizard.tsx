'use client';

import React, { useState } from 'react';
import IndividualDetailsForm from './IndividualDetailsForm';
import BenefitSelectionStep, { ConfiguredBenefit } from './BenefitSelectionStep';
import BenefitConfigurationStep from './BenefitConfigurationStep';
import type { BenefitTemplate } from '@/lib/benefitDesignerClient';

type WizardStep = 'personalDetails' | 'benefitSelection' | 'benefitConfiguration';

// Generate a unique ID for local benefit tracking
function generateLocalId(): string {
  return `benefit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

type IndividualQuoteWizardProps = {
  onComplete: (data: {
    personalDetails: Record<string, unknown>;
    configuredBenefits: ConfiguredBenefit[];
  }) => void;
  onExitWizard: () => void;
};

export default function IndividualQuoteWizard({
  onComplete,
  onExitWizard,
}: IndividualQuoteWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('personalDetails');
  const [personalDetails, setPersonalDetails] = useState<Record<string, unknown>>({});
  const [configuredBenefits, setConfiguredBenefits] = useState<ConfiguredBenefit[]>([]);

  // For benefit configuration sub-step
  const [configuringTemplate, setConfiguringTemplate] = useState<BenefitTemplate | null>(null);
  const [editingBenefit, setEditingBenefit] = useState<ConfiguredBenefit | null>(null);

  // Handle personal details step completion
  const handlePersonalDetailsNext = (data: Record<string, unknown>) => {
    setPersonalDetails(data);
    setCurrentStep('benefitSelection');
  };

  // Handle benefit configuration request
  const handleConfigureBenefit = (template: BenefitTemplate, existing?: ConfiguredBenefit) => {
    setConfiguringTemplate(template);
    setEditingBenefit(existing || null);
    setCurrentStep('benefitConfiguration');
  };

  // Handle benefit configuration save
  const handleSaveBenefit = (values: Record<string, unknown>) => {
    if (editingBenefit) {
      // Update existing benefit
      setConfiguredBenefits((prev) =>
        prev.map((b) =>
          b.localId === editingBenefit.localId ? { ...b, configuredValues: values } : b
        )
      );
    } else if (configuringTemplate) {
      // Add new benefit
      const instanceCount = configuredBenefits.filter(
        (b) => b.template.templateId === configuringTemplate.templateId
      ).length;

      setConfiguredBenefits((prev) => [
        ...prev,
        {
          localId: generateLocalId(),
          template: configuringTemplate,
          configuredValues: values,
          instanceNumber: instanceCount + 1,
        },
      ]);
    }

    // Return to benefit selection
    setConfiguringTemplate(null);
    setEditingBenefit(null);
    setCurrentStep('benefitSelection');
  };

  // Handle benefit configuration cancel
  const handleCancelConfiguration = () => {
    setConfiguringTemplate(null);
    setEditingBenefit(null);
    setCurrentStep('benefitSelection');
  };

  // Handle benefit removal
  const handleRemoveBenefit = (localId: string) => {
    setConfiguredBenefits((prev) => prev.filter((b) => b.localId !== localId));
  };

  // Handle going back from benefit selection to personal details
  const handleBackToPersonalDetails = () => {
    setCurrentStep('personalDetails');
  };

  // Handle final submission
  const handleFinish = () => {
    onComplete({
      personalDetails,
      configuredBenefits,
    });
  };

  // Get step info for header
  const getStepInfo = () => {
    switch (currentStep) {
      case 'personalDetails':
        return { number: 1, name: 'Personal Details', total: 2 };
      case 'benefitSelection':
        return { number: 2, name: 'Benefit Selection', total: 2 };
      case 'benefitConfiguration':
        return {
          number: 2,
          name: `Configure: ${configuringTemplate?.name || 'Benefit'}`,
          total: 2,
        };
      default:
        return { number: 1, name: 'Personal Details', total: 2 };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      {/* Step Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold form-label">
          Step {stepInfo.number}: {stepInfo.name}
        </h3>
        <div className="text-sm form-label">{stepInfo.number} of {stepInfo.total}</div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {currentStep === 'personalDetails' && (
          <IndividualDetailsForm
            initialData={personalDetails as {
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
            }}
            onNext={handlePersonalDetailsNext}
            onPrevious={onExitWizard}
            isFirstStep={true}
            isLastStep={false}
          />
        )}

        {currentStep === 'benefitSelection' && (
          <BenefitSelectionStep
            configuredBenefits={configuredBenefits}
            onConfigureBenefit={handleConfigureBenefit}
            onRemoveBenefit={handleRemoveBenefit}
            onPrevious={handleBackToPersonalDetails}
            onFinish={handleFinish}
          />
        )}

        {currentStep === 'benefitConfiguration' && configuringTemplate && (
          <BenefitConfigurationStep
            template={configuringTemplate}
            existingBenefit={editingBenefit || undefined}
            onSave={handleSaveBenefit}
            onCancel={handleCancelConfiguration}
          />
        )}
      </div>
    </div>
  );
}
