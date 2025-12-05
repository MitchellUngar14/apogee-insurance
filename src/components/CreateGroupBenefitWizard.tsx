// src/components/CreateGroupBenefitWizard.tsx
'use client';

import React from 'react';
import Wizard from '@/components/Wizard';

interface CreateGroupBenefitWizardProps {
  onComplete: (data: any) => void;
  onExitWizard: () => void;
}

export default function CreateGroupBenefitWizard({ onComplete, onExitWizard }: CreateGroupBenefitWizardProps) {
  const groupBenefitSteps = [
    { id: 'groupBenefitDetails', name: 'Group Benefit Details', component: <p>Form for Group Benefit Details</p> },
    { id: 'confirmGroupBenefit', name: 'Confirm Group Benefit', component: <p>Confirmation of Group Benefit</p> },
  ];

  return (
    <Wizard
      steps={groupBenefitSteps}
      onComplete={onComplete}
      onExitWizard={onExitWizard}
    />
  );
}
