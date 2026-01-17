export const getResidencyDisplay = (residency: string): string => {
  switch (residency) {
    case 'citizen':
      return 'Kenyan Citizen';
    case 'resident':
      return 'Kenyan Resident';
    case 'nonResident':
      return 'Non-resident / International Visitor';
    default:
      return 'Unknown';
  }
};

export const getCurrency = (residency: string): string => {
  return residency === 'citizen' ? 'KSh' : 'USD';
};

export const formatPriceByResidency = (price: number, residency: string): string => {
  const currency = getCurrency(residency);
  return `${currency} ${price.toLocaleString()}`;
};
