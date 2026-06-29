'use client';

import type { ReactNode } from 'react';
import {
  PHONE_COUNTRIES,
  getPhoneCountry,
  normalizePhoneDigitsForCountry,
} from '@/lib/phone';
import styles from './PhoneField.module.css';

type PhoneFieldProps = {
  label: ReactNode;
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  required?: boolean;
  error?: string;
  idPrefix?: string;
};

export default function PhoneField({
  label,
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  required = false,
  error,
  idPrefix = 'phone',
}: PhoneFieldProps) {
  const activeCountry = getPhoneCountry(countryCode);

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.controls}>
        <select
          id={`${idPrefix}-country`}
          className={`form-input ${styles.countrySelect}`}
          value={countryCode}
          onChange={(event) => {
            const nextCountryCode = event.target.value;
            onCountryCodeChange(nextCountryCode);
            onPhoneNumberChange(
              normalizePhoneDigitsForCountry(phoneNumber, nextCountryCode),
            );
          }}
        >
          {PHONE_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.dialCode})
            </option>
          ))}
        </select>

        <input
          id={`${idPrefix}-number`}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          className={`form-input ${styles.numberInput}`}
          value={phoneNumber}
          onChange={(event) =>
            onPhoneNumberChange(
              normalizePhoneDigitsForCountry(event.target.value, countryCode),
            )
          }
          placeholder={activeCountry.placeholder}
          maxLength={activeCountry.maxDigits}
          required={required}
        />
      </div>
      {error ? <span className={`${styles.meta} ${styles.metaError}`}>{error}</span> : null}
    </label>
  );
}
