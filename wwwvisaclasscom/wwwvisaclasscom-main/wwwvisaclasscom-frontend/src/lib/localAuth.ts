export interface LocalUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  country?: string;
  bio?: string;
}

interface StoredAccount extends LocalUser {
  password: string;
}

const ACCOUNTS_KEY = "visaclass_accounts";
const SESSION_KEY = "visaclass_session_email";
const AUTH_EVENT = "visaclass-auth-changed";

function readAccounts(): Record<string, StoredAccount> {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, StoredAccount>;
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, StoredAccount>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function emitAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function signupLocal(fullName: string, email: string, password: string): LocalUser {
  const accounts = readAccounts();
  const key = normalizeEmail(email);
  if (accounts[key]) {
    throw new Error("This email is already registered.");
  }

  const account: StoredAccount = {
    id: crypto.randomUUID(),
    email: key,
    fullName: fullName.trim(),
    password,
    phone: "",
    country: "",
    bio: "",
  };

  accounts[key] = account;
  writeAccounts(accounts);
  localStorage.setItem(SESSION_KEY, key);
  emitAuthChange();
  const { password: _password, ...user } = account;
  return user;
}

export function loginLocal(email: string, password: string): LocalUser {
  const accounts = readAccounts();
  const key = normalizeEmail(email);
  const account = accounts[key];
  if (!account || account.password !== password) {
    throw new Error("Invalid email or password.");
  }
  localStorage.setItem(SESSION_KEY, key);
  emitAuthChange();
  const { password: _password, ...user } = account;
  return user;
}

export function logoutLocal(): void {
  localStorage.removeItem(SESSION_KEY);
  emitAuthChange();
}

export function getCurrentUserLocal(): LocalUser | null {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const account = readAccounts()[email];
  if (!account) return null;
  const { password: _password, ...user } = account;
  return user;
}

export function updateCurrentUserLocalProfile(
  patch: Partial<Pick<LocalUser, "fullName" | "phone" | "country" | "bio">>,
): LocalUser {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) {
    throw new Error("Not authenticated.");
  }
  const accounts = readAccounts();
  const account = accounts[email];
  if (!account) {
    throw new Error("User account not found.");
  }
  const next = { ...account, ...patch };
  accounts[email] = next;
  writeAccounts(accounts);
  const { password: _password, ...user } = next;
  return user;
}

export function onLocalAuthStateChange(callback: (user: LocalUser | null) => void): () => void {
  const handler = () => callback(getCurrentUserLocal());
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  callback(getCurrentUserLocal());
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
