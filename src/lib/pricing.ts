export interface PricingTier {
  citizenPrice: number;
  residentPrice: number;
  nonResidentPrice: number;
  citizenChildPrice?: number;
  residentChildPrice?: number;
  nonResidentChildPrice?: number;
}

export const getPriceByResidency = (pricing: PricingTier, residency: string | null): number | null => {
  if (!residency) return null;

  switch (residency) {
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

export const getChildPriceByResidency = (pricing: PricingTier, residency: string | null): number | null => {
  if (!residency) return null;

  switch (residency) {
    case 'citizen':
      return pricing.citizenChildPrice ?? 0;
    case 'resident':
      return pricing.residentChildPrice ?? 0;
    case 'nonResident':
      return pricing.nonResidentChildPrice ?? 0;
    default:
      return 0;
  }
};

export const formatPrice = (price: number | null, residency: string = 'citizen'): string => {
  if (price === null) return 'Select residency';
  const currency = (residency === 'citizen' || !residency) ? 'KSh' : 'USD';
  return `${currency} ${price.toLocaleString()}`;
};

export const getResidencyLabel = (residency: string | null): string => {
  switch (residency) {
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
