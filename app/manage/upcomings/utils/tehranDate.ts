const TIME_FORMATTER = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: "Asia/Tehran",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: "Asia/Tehran",
  dateStyle: "medium",
});

function coerceDate(
  value?: number | string | Date | null,
): Date | undefined {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? undefined : fromNumber;
  }
  const trimmed = String(value).trim();

  if (!trimmed) return undefined;
  const direct = new Date(trimmed);

  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ Tt](\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) return undefined;
  const [, Y, Mo, D, H, Mi, S] = match;

  return new Date(
    Number(Y),
    Number(Mo) - 1,
    Number(D),
    Number(H),
    Number(Mi),
    S ? Number(S) : 0,
  );
}

export function formatTehranTime(
  value?: number | string | Date | null,
): string | undefined {
  const date = coerceDate(value);

  if (!date) return undefined;
  try {
    return TIME_FORMATTER.format(date);
  } catch {
    return undefined;
  }
}

export function formatTehranDate(
  value?: number | string | Date | null,
): string | undefined {
  const date = coerceDate(value);

  if (!date) return undefined;
  try {
    return DATE_FORMATTER.format(date);
  } catch {
    return undefined;
  }
}
