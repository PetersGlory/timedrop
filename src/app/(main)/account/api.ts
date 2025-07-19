// API utility for wallet-related actions
// Backend base URL
const BASE_URL = 'https://timedrop-backend.onrender.com/api';

// Helper to handle fetch with auth
async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'API Error');
  }
  return res.json();
}

// Fetch wallet balance
export async function getWalletBalance(token: string) {
  return apiFetch('/wallet', { method: 'GET' }, token);
}

// Deposit funds (after successful Flutterwave payment)
export async function depositFunds(amount: number, token: string) {
  return apiFetch('/wallet/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }, token);
}

// Withdraw funds
export async function withdrawFunds(amount: number, token: string) {
  return apiFetch('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }, token);
} 