'use client';

type CustomerServiceHomeProps = {
  onViewQuotes: () => void;
  onViewPolicies: () => void;
};

export default function CustomerServiceHome({ onViewQuotes, onViewPolicies }: CustomerServiceHomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-2">
      <h2 className="text-3xl font-semibold mb-8 form-label">
        Customer Service Portal
      </h2>
      <p className="text-lg mb-8 form-label text-center max-w-md">
        Search and manage quotes from the Quoting Service, or view and manage existing policies.
      </p>
      <div className="flex space-x-6">
        <button
          onClick={onViewQuotes}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:bg-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-soft-blue-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#0284c7' }}
        >
          Search Quotes
        </button>
        <button
          onClick={onViewPolicies}
          className="px-8 py-4 text-white text-lg font-medium rounded-lg shadow-md hover:bg-soft-green-600 focus:outline-none focus:ring-2 focus:ring-soft-green-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
          style={{ backgroundColor: '#22c55e' }}
        >
          Search Policies
        </button>
      </div>
    </div>
  );
}
