'use client';

type BenefitDesignerHomeProps = {
  onCreateIndividualPlan: () => void;
  onCreateGroupPlan: () => void;
  onViewPlans: () => void;
};

export default function BenefitDesignerHome({
  onCreateIndividualPlan,
  onCreateGroupPlan,
  onViewPlans,
}: BenefitDesignerHomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-2">
      <h2 className="text-3xl font-semibold mb-8 form-label">
        Benefit Designer Portal
      </h2>
      <p className="text-lg mb-8 form-label text-center max-w-md">
        Create and manage benefit plan templates for individual and group insurance products.
      </p>
      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <button
          onClick={onCreateIndividualPlan}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#FFA500' }}
        >
          Create Individual Benefit Plan
        </button>
        <button
          onClick={onCreateGroupPlan}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#FFA500' }}
        >
          Create Group Benefit Plan
        </button>
        <button
          onClick={onViewPlans}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:bg-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-soft-blue-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#0284c7' }}
        >
          View Existing Plans
        </button>
      </div>
    </div>
  );
}
