'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BenefitDesignerHome from '@/components/BenefitDesignerHome';
import BenefitTypeSelector from '@/components/BenefitTypeSelector';
import ViewBenefits from '@/components/ViewBenefits';
import TemplateDesigner from '@/components/TemplateDesigner';
import { useHeader } from '@/context/HeaderContext';

type View = 'home' | 'selectType' | 'view' | 'designer';

export default function Home() {
  const { setHeaderTitle, setShowHomeButton } = useHeader();
  const searchParams = useSearchParams();

  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedBenefitType, setSelectedBenefitType] = useState<'individual' | 'group' | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  // Check for query parameter to show specific view
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'benefits') {
      setCurrentView('view');
    }
  }, [searchParams]);

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedBenefitType(null);
    setEditingTemplateId(null);
  };

  const handleCreateBenefit = () => {
    setCurrentView('selectType');
  };

  const handleViewBenefits = () => {
    setCurrentView('view');
  };

  const handleSelectBenefitType = (type: 'individual' | 'group') => {
    setSelectedBenefitType(type);
    setEditingTemplateId(null);
    setCurrentView('designer');
  };

  const handleEditTemplate = (templateId: number) => {
    setEditingTemplateId(templateId);
    setSelectedBenefitType(null);
    setCurrentView('designer');
  };

  const handleBackFromDesigner = () => {
    if (editingTemplateId) {
      // Was editing, go back to view list
      setCurrentView('view');
    } else {
      // Was creating, go back to type selector
      setCurrentView('selectType');
    }
    setEditingTemplateId(null);
  };

  const handleSaveTemplate = () => {
    // After saving, go to view list
    setCurrentView('view');
    setEditingTemplateId(null);
    setSelectedBenefitType(null);
  };

  const handleCreateNewFromView = () => {
    setCurrentView('selectType');
  };

  // Render based on current view
  if (currentView === 'designer') {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <TemplateDesigner
          templateId={editingTemplateId ?? undefined}
          initialType={selectedBenefitType ?? undefined}
          onBack={handleBackFromDesigner}
          onSave={handleSaveTemplate}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {currentView === 'home' && (
        <BenefitDesignerHome
          onCreateBenefit={handleCreateBenefit}
          onViewBenefits={handleViewBenefits}
        />
      )}
      {currentView === 'selectType' && (
        <BenefitTypeSelector
          onSelectType={handleSelectBenefitType}
          onBack={handleBackToHome}
        />
      )}
      {currentView === 'view' && (
        <ViewBenefits
          onBack={handleBackToHome}
          onEditTemplate={handleEditTemplate}
          onCreateNew={handleCreateNewFromView}
        />
      )}
    </div>
  );
}
