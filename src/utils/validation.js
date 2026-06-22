export const normalizeText = (value) => String(value ?? '').trim();

export const normalizeOptionalText = (value) => {
  const text = normalizeText(value);
  return text || '';
};

export const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const isValidEmail = (value) => {
  const email = normalizeText(value);
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (value) => {
  const phone = normalizeText(value);
  if (!phone) return true;
  return /^[+\d][\d\s().-]{5,}$/.test(phone);
};

export const requireText = (value, message) => {
  if (!normalizeText(value)) throw new Error(message);
};

export const requireNonNegative = (value, message) => {
  if (normalizeNumber(value, -1) < 0) throw new Error(message);
};

export const cleanObjectStrings = (data) => Object.entries(data || {}).reduce((acc, [key, value]) => {
  acc[key] = typeof value === 'string' ? value.trim() : value;
  return acc;
}, {});