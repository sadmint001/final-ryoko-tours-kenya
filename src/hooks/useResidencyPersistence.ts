// hooks/useResidencyPersistence.ts
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useResidencyPersistence = () => {
  const [searchParams] = useSearchParams();
  const [selectedResidency, setSelectedResidency] = useState<string | null>(() => {
    // Check in order: URL params, sessionStorage, localStorage
    const urlResidency = searchParams.get('residency');
    if (urlResidency) {
      sessionStorage.setItem('destinationResidency', urlResidency);
      return urlResidency;
    }
    
    const sessionResidency = sessionStorage.getItem('destinationResidency');
    if (sessionResidency) return sessionResidency;
    
    return null;
  });

  const setResidency = (residency: string | null) => {
    if (residency) {
      sessionStorage.setItem('destinationResidency', residency);
      setSelectedResidency(residency);
    } else {
      sessionStorage.removeItem('destinationResidency');
      setSelectedResidency(null);
    }
  };

  const clearResidency = () => {
    sessionStorage.removeItem('destinationResidency');
    setSelectedResidency(null);
  };

  return {
    selectedResidency,
    setResidency,
    clearResidency
  };
};