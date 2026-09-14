export const parsePrice = (value) => {
  if (typeof value === 'number') return value;
  return Number(String(value ?? '').replace(/\D/g, '')) || 0;
};

export const calculateItemTotal = (item) => {
  const basePrice = parsePrice(item.price);
  const addonsTotal = (item.addons || []).reduce(
    (sum, addon) => sum + parsePrice(addon.price),
    0,
  );

  return (basePrice + addonsTotal) * Math.max(1, Number(item.quantity) || 1);
};

export const calculateQuoteTotal = (items = []) =>
  items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount || 0);