import React from 'react';
import { useParams } from 'react-router-dom';

// Placeholder component - will be fully implemented in Task 2
export const SharedAnalysis: React.FC = () => {
  // Extract shareToken from URL path manually (no react-router)
  const shareToken = window.location.pathname.split('/a/')[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Shared Analysis</h2>
        <p className="text-gray-600 mb-4">
          Share Token: {shareToken}
        </p>
        <p className="text-sm text-gray-500">
          This feature is coming soon! Public analysis sharing will be implemented shortly.
        </p>
      </div>
    </div>
  );
};

export default SharedAnalysis;
