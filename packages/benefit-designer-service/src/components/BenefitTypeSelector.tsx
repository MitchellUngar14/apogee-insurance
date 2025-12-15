'use client';

type BenefitTypeSelectorProps = {
  onSelectType: (type: 'individual' | 'group') => void;
  onBack: () => void;
};

export default function BenefitTypeSelector({
  onSelectType,
  onBack,
}: BenefitTypeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-2">
      <h2 className="text-3xl font-semibold mb-4 form-label">
        Create Benefit Template
      </h2>
      <p className="text-lg mb-8 form-label text-center max-w-md">
        Select the type of benefit template you want to create.
      </p>
      <div className="flex space-x-6 mb-6">
        <button
          onClick={() => onSelectType('group')}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#FFA500' }}
        >
          Group Benefit
        </button>
        <button
          onClick={() => onSelectType('individual')}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#FFA500' }}
        >
          Individual Benefit
        </button>
      </div>
      <p className="text-sm mb-6 form-label text-center max-w-lg text-gray-600 dark:text-gray-400">
        <strong>Group Benefits:</strong> Extended Health, Dental, Vision, Life Insurance for employee groups.
        <br />
        <strong>Individual Benefits:</strong> Car Insurance, Home Insurance, Boat Insurance, and more.
      </p>
      <button
        onClick={onBack}
        className="px-6 py-2 text-white rounded-md hover:opacity-80 transition-colors"
        style={{ backgroundColor: '#FFA500' }}
      >
        &larr; Back
      </button>
    </div>
  );
}
