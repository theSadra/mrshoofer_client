export function normalizeIranPhoneNumber(value?: string | null): string | null {
  if (!value) return null;

  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) return null;

  let normalized = digitsOnly;

  if (normalized.startsWith("0098")) {
    normalized = normalized.slice(4);
  } else if (normalized.startsWith("98")) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  }

  if (!normalized.startsWith("9") || normalized.length !== 10) {
    return null;
  }

  return `0${normalized}`;
}

export function formatPhoneForSms(value: string): string {
  const normalized = normalizeIranPhoneNumber(value);

  if (!normalized) {
    return value;
  }

  return normalized;
}

export function maskPhoneNumber(value: string): string {
  const normalized = normalizeIranPhoneNumber(value);

  if (!normalized) return value;

  return normalized.replace(/^(\d{4})\d{3}(\d{4})$/, "$1***$2");
}
