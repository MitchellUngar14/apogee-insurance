'use client';

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || '/';

type BenefitDesignerHomeProps = {
  onCreateBenefit: () => void;
  onViewBenefits: () => void;
};

export default function BenefitDesignerHome({
  onCreateBenefit,
  onViewBenefits,
}: BenefitDesignerHomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-2">
      <h2 className="text-3xl font-semibold mb-8 form-label">
        Benefit Designer Portal
      </h2>
      <p className="text-lg mb-8 form-label text-center max-w-md">
        Create and manage benefit templates for individual and group insurance products.
      </p>
      <div className="flex space-x-6 mb-6">
        <button
          onClick={onCreateBenefit}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#FFA500' }}
        >
          Create Benefit Template
        </button>
        <button
          onClick={onViewBenefits}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#FFA500' }}
        >
          View Benefit Templates
        </button>
      </div>
      <a
        href={PORTAL_URL}
        className="px-6 py-2 text-white rounded-md hover:opacity-80 transition-colors"
        style={{ backgroundColor: '#FFA500' }}
      >
        &larr; Back to Apogee Insurance
      </a>
    </div>
  );
}
