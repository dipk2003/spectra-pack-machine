export type PhoneCountry = {
  code: string;
  name: string;
  dialCode: string;
  minDigits: number;
  maxDigits: number;
  placeholder: string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '9876543210',
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '5551234567',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    minDigits: 9,
    maxDigits: 10,
    placeholder: '7400123456',
  },
  {
    code: 'AE',
    name: 'UAE',
    dialCode: '+971',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '501234567',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    minDigits: 9,
    maxDigits: 9,
    placeholder: '512345678',
  },
  {
    code: 'NP',
    name: 'Nepal',
    dialCode: '+977',
    minDigits: 10,
    maxDigits: 10,
    placeholder: '9812345678',
  },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0].code;

export const getPhoneCountry = (countryCode: string) =>
  PHONE_COUNTRIES.find((country) => country.code === countryCode) ?? PHONE_COUNTRIES[0];

export const sanitizePhoneDigits = (value: string) => value.replace(/\D/g, '');

export const normalizePhoneDigitsForCountry = (
  value: string,
  countryCode: string,
) => {
  const country = getPhoneCountry(countryCode);
  return sanitizePhoneDigits(value).slice(0, country.maxDigits);
};

export const buildPhoneValue = (countryCode: string, phoneNumber: string) => {
  const country = getPhoneCountry(countryCode);
  const digits = normalizePhoneDigitsForCountry(phoneNumber, country.code);

  if (!digits) return '';
  return `${country.dialCode} ${digits}`;
};

export const getPhoneHelperText = (countryCode: string) => {
  const country = getPhoneCountry(countryCode);

  if (country.minDigits === country.maxDigits) {
    return `${country.name}: enter ${country.maxDigits} digits after ${country.dialCode}`;
  }

  return `${country.name}: enter ${country.minDigits}-${country.maxDigits} digits after ${country.dialCode}`;
};

export const getPhoneValidationMessage = (
  countryCode: string,
  phoneNumber: string,
  required = true,
) => {
  const country = getPhoneCountry(countryCode);
  const digits = sanitizePhoneDigits(phoneNumber);

  if (!digits) {
    return required ? 'Phone number is required.' : '';
  }

  if (digits.length < country.minDigits || digits.length > country.maxDigits) {
    if (country.minDigits === country.maxDigits) {
      return `Enter exactly ${country.maxDigits} digits for ${country.name}.`;
    }

    return `Enter ${country.minDigits}-${country.maxDigits} digits for ${country.name}.`;
  }

  return '';
};

export const normalizeStoredPhone = (value: unknown) => {
  const raw = String(value || '').trim().replace(/\s+/g, ' ');
  const digits = sanitizePhoneDigits(raw);

  if (!digits) {
    return '';
  }

  if (digits.length < 6 || digits.length > 15) {
    throw new Error('phone is invalid');
  }

  if (raw.startsWith('+')) {
    return raw.slice(0, 30);
  }

  return digits.slice(0, 20);
};
