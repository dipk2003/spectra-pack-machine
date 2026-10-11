export function normalizeTown(value: unknown) {
  if (typeof value !== 'string') return '';
  const town = value.trim().replace(/\s+/g, ' ');
  return town.length <= 120 && !/[\u0000-\u001f\u007f<>]/.test(town) ? town : '';
}
export function normalizePin(value: unknown) {
  return typeof value === 'string' && /^[1-9][0-9]{5}$/.test(value.trim()) ? value.trim() : '';
}
