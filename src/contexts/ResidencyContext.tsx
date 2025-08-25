import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ResidencyContextType {
  selectedResidency: string | null;
  setSelectedResidency: (residency: string | null) => void;
}

const ResidencyContext = createContext<ResidencyContextType | undefined>(undefined);

export const useResidency = () => {
  const context = useContext(ResidencyContext);
  if (context === undefined) {
    throw new Error('useResidency must be used within a ResidencyProvider');
  }
  return context;
};

interface ResidencyProviderProps {
  children: ReactNode;
}

export const ResidencyProvider: React.FC<ResidencyProviderProps> = ({ children }) => {
  const [selectedResidency, setSelectedResidency] = useState<string | null>(() => {
    // Try to get from localStorage on initial load
    const saved = localStorage.getItem('selectedResidency');
    return saved ? saved : null;
  });

  const handleSetSelectedResidency = (residency: string | null) => {
    setSelectedResidency(residency);
    // Save to localStorage for persistence
    if (residency) {
      localStorage.setItem('selectedResidency', residency);
    } else {
      localStorage.removeItem('selectedResidency');
    }
  };

  return (
    <ResidencyContext.Provider value={{
      selectedResidency,
      setSelectedResidency: handleSetSelectedResidency,
    }}>
      {children}
    </ResidencyContext.Provider>
  );
};
