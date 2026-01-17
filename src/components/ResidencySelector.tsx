import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useResidency } from '@/contexts/ResidencyContext';

interface ResidencySelectorProps {
  className?: string;
}

const ResidencySelector: React.FC<ResidencySelectorProps> = ({
  className = ""
}) => {
  const { selectedResidency, setSelectedResidency } = useResidency();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!selectedResidency) {
      setShowModal(true);
    }
  }, [selectedResidency]);

  const selectResidency = (type: string) => {
    setSelectedResidency(type);
    setShowModal(false);
  };

  const getResidencyLabel = (residencyKey: string | null) => {
    switch (residencyKey) {
      case 'citizen':
        return 'Kenyan Citizen';
      case 'resident':
        return 'Kenyan Resident';
      case 'nonResident':
        return 'International Visitor';
      default:
        return 'Not Selected';
    }
  };

  return (
    <>
      {selectedResidency ? (
        <div className={`flex justify-between items-center bg-gradient-to-r from-orange-500 to-yellow-500 text-black p-3 rounded-lg mb-8 ${className}`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Residency: {getResidencyLabel(selectedResidency)}</span>
          </div>
          <button
            className="bg-white text-black px-4 py-1 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
            onClick={() => setShowModal(true)}
          >
            Change
          </button>
        </div>
      ) : (
        <div className={`flex justify-center items-center bg-gradient-to-r from-orange-500 to-yellow-500 text-black p-3 rounded-lg mb-8 ${className}`}>
          <span className="font-semibold mr-2">Please select your residency</span>
          <button
            className="bg-white text-black px-4 py-1 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
            onClick={() => setShowModal(true)}
          >
            Select Residency
          </button>
        </div>
      )}

      {/* Residency Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-orange-600 mb-2">Select Your Residency Status</h3>
            <p className="text-gray-600 mb-6">Choose your residency to see accurate pricing for our tours</p>
            
            <div className="space-y-3 mb-6">
              <div
                className="border border-gray-200 p-4 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors"
                onClick={() => selectResidency('citizen')}
              >
                <h4 className="font-semibold text-orange-600">Kenyan Citizen</h4>
                <p className="text-sm text-gray-600">Kenyan ID holders</p>
              </div>
              
              <div
                className="border border-gray-200 p-4 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors"
                onClick={() => selectResidency('resident')}
              >
                <h4 className="font-semibold text-orange-600">Resident</h4>
                <p className="text-sm text-gray-600">Foreign residents with valid permit</p>
              </div>
              
              <div
                className="border border-gray-200 p-4 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors"
                onClick={() => selectResidency('nonResident')}
              >
                <h4 className="font-semibold text-orange-600">Non-Resident</h4>
                <p className="text-sm text-gray-600">International visitors</p>
              </div>
            </div>
            
            <button
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black py-2 rounded-lg font-semibold transition-colors"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResidencySelector;
