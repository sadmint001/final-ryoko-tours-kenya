export interface PricingTier {
  citizenPrice: number;
  residentPrice: number;
  nonResidentPrice: number;
}

export const getPriceByResidency = (pricing: PricingTier, residency: string | null): number | null => {
  if (!residency) return null;
  
  switch(residency) {
    case 'citizen':
      return pricing.citizenPrice;
    case 'resident':
      return pricing.residentPrice;
    case 'nonResident':
      return pricing.nonResidentPrice;
    default:
      return null;
  }
};

export const formatPrice = (price: number | null): string => {
  if (price === null) return 'Select residency';
  return `KSh ${price.toLocaleString()}`;
};

export const getResidencyLabel = (residency: string | null): string => {
  switch(residency) {
    case 'citizen':
      return 'Kenyan Citizens';
    case 'resident':
      return 'Residents';
    case 'nonResident':
      return 'Non-Residents';
    default:
      return 'Select residency';
  }
};
