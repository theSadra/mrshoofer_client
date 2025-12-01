export type AdminOtpRecord = {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
};

type AdminOtpStore = Map<string, AdminOtpRecord>;

declare global {
  // eslint-disable-next-line no-var
  var __adminOtpStore: AdminOtpStore | undefined;
}

const globalStore = globalThis as typeof globalThis & {
  __adminOtpStore?: AdminOtpStore;
};

const store: AdminOtpStore = globalStore.__adminOtpStore ?? new Map();

if (!globalStore.__adminOtpStore) {
  globalStore.__adminOtpStore = store;
}

function purgeIfExpired(phone: string) {
  const record = store.get(phone);

  if (record && record.expiresAt <= Date.now()) {
    store.delete(phone);
  }
}

export function getAdminOtpRecord(phone: string): AdminOtpRecord | null {
  purgeIfExpired(phone);

  return store.get(phone) ?? null;
}

export function saveAdminOtpRecord(
  phone: string,
  code: string,
  expiresAt: Date,
) {
  store.set(phone, {
    code,
    expiresAt: expiresAt.getTime(),
    attempts: 0,
    lastSentAt: Date.now(),
  });
}

export function deleteAdminOtpRecord(phone: string) {
  store.delete(phone);
}

export function incrementAdminOtpAttempts(phone: string): number {
  const record = store.get(phone);

  if (!record) {
    return 0;
  }

  const attempts = (record.attempts ?? 0) + 1;
  store.set(phone, { ...record, attempts });

  return attempts;
}

export function updateAdminOtpRecord(
  phone: string,
  updater: (record: AdminOtpRecord | null) => AdminOtpRecord | null,
) {
  const next = updater(store.get(phone) ?? null);

  if (!next) {
    store.delete(phone);

    return;
  }

  store.set(phone, next);
}
