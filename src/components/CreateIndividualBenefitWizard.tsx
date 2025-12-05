// src/components/CreateIndividualBenefitWizard.tsx
'use client';

import React from 'react';
import Wizard from '@/components/Wizard';

interface CreateIndividualBenefitWizardProps {
  onComplete: (data: any) => void;
  onExitWizard: () => void;
}

export default function CreateIndividualBenefitWizard({ onComplete, onExitWizard }: CreateIndividualBenefitWizardProps) {
  const individualBenefitSteps = [
    { id: 'individualBenefitDetails', name: 'Individual Benefit Details', component: <p>Form for Individual Benefit Details</p> },
    { id: 'confirmIndividualBenefit', name: 'Confirm Individual Benefit', component: <p>Confirmation of Individual Benefit</p> },
  ];

  return (
    <Wizard
      steps={individualBenefitSteps}
      onComplete={onComplete}
      onExitWizard={onExitWizard}
    />
  );
}
