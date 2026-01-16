import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useResidency } from '@/contexts/ResidencyContext';

const SelectResidency: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedResidency } = useResidency();

  const residencyOptions = [
    { key: 'citizen', label: 'Kenyan Citizen' },
    { key: 'resident', label: 'Kenyan Resident (Non-citizen living or working in Kenya)' },
    { key: 'nonResident', label: 'Non-resident / International Visitor' },
  ];

  const handleSelectResidency = useCallback((key: string) => {
    setSelectedResidency(key as any);
    try { localStorage.setItem('selectedResidency', key); } catch {}
    navigate('/destinations');
  }, [setSelectedResidency, navigate]);
  
  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
            <h2 className="text-3xl font-display font-bold text-primary text-center">Please confirm your residency status</h2>
            <p className="text-center text-muted-foreground">This helps us provide you with accurate pricing for our tours and experiences.</p>
            
            <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 mt-4">
              {residencyOptions.map((opt) => (
                <button
                  key={opt.key}
                  className="w-full text-left px-6 py-4 hover:bg-gray-100 text-black border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                  onClick={() => handleSelectResidency(opt.key)}
                >
                  <span className="font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
};

export default SelectResidency;
