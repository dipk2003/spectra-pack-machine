'use client';

type ConsentPreferencesButtonProps = {
  className?: string;
};

export default function ConsentPreferencesButton({
  className,
}: ConsentPreferencesButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new Event('spectra:reset-analytics-consent'));
      }}
    >
      Analytics preferences
    </button>
  );
}
