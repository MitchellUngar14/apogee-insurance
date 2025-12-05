// src/components/Wizard.tsx
'use client';

import React, { useState, ReactNode, isValidElement, cloneElement } from 'react';

interface WizardStep {
  id: string;
  name: string;
  component: ReactNode;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete?: (data: any) => void;
  initialData?: any;
  onExitWizard?: () => void;
  headerColor?: string; // New prop for header color
}

export default function Wizard({ steps, onComplete, initialData, onExitWizard, headerColor }: WizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialData || {});

  const currentStep = steps[currentStepIndex];

  const goToNextStep = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete?.({ ...formData, ...newData });
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex === 0) {
      onExitWizard?.(); // Call the exit function if on the first step
    } else {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const currentStepComponent = isValidElement(currentStep.component)
    ? typeof currentStep.component.type === 'string' // Check if it's an intrinsic HTML element
      ? currentStep.component // Render intrinsic elements directly
      : cloneElement(currentStep.component, { // Pass props to custom components
          onNext: goToNextStep,
          onPrevious: goToPreviousStep,
          initialData: formData, // Pass all accumulated form data to the current step
          isFirstStep: currentStepIndex === 0,
          isLastStep: currentStepIndex === steps.length - 1,
        })
    : currentStep.component;


  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold form-label" style={headerColor ? { color: headerColor } : undefined}>
          Step {currentStepIndex + 1}: {currentStep.name}
        </h3>
        <div className="text-sm form-label">
          {currentStepIndex + 1} of {steps.length}
        </div>
      </div>

      <div className="mb-6">{currentStepComponent}</div>

      {/* Navigation buttons are now handled by individual step components */}
    </div>
  );
}
