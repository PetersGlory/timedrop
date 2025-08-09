// API utility for wallet-related actions and authentication
// Backend base URL
const BASE_URL = 'https://backendapi.timedrop.live/api'; // || 'https://timedrop-backend.onrender.com/api';

// Helper for authenticated fetch
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

// Authentication endpoints
export async function loginUser(email: string, password: string) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  [key: string]: any;
}) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logoutUser(token: string) {
  return apiFetch('/auth/logout', {
    method: 'POST',
  }, token);
}

export async function getProfile(token: string) {
  return apiFetch('/auth/me', {
    method: 'GET',
  }, token);
}

// Fetch wallet balance
export async function getWalletBalance(token: string) {
  return apiFetch('/wallets', { method: 'GET' }, token);
}

// Deposit funds (after successful Flutterwave payment)
export async function depositFunds(amount: number, token: string) {
  return apiFetch('/wallets/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }, token);
}

// Withdraw funds
export async function withdrawFunds(
  data: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration?: string;
    currency?: string;
    reference?: string;
    callback_url?: string;
    debit_currency?: string;
  },
  token: string
) {
  return apiFetch(
    '/wallets/withdraw',
    {
      method: 'POST',
      body: JSON.stringify({
        account_bank: data.account_bank,
        account_number: data.account_number,
        amount: data.amount,
        narration: data.narration,
        currency: data.currency,
        reference: data.reference,
        callback_url: data.callback_url,
        debit_currency: data.debit_currency,
      }),
    },
    token
  );
}

export async function getBanks(token: string, country: string = "ng") {
  // Explicitly set the Authorization header to ensure it's included
  return apiFetch(
    `/wallets/banks/${country}`,
    {
      method: 'GET'
    },
    token
  );
}

export async function validateAccount(
  data: { account_number: string; account_bank: string },
  token: string
) {
  return apiFetch(
    '/wallets/verify-account',
    {
      method: 'POST',
      body: JSON.stringify({
        account_number: data.account_number,
        account_bank: data.account_bank,
      }),
    },
    token
  );
}



// --- Bookmarks ---

export async function getBookmarks(token: string) {
  return apiFetch('/bookmarks', { method: 'GET' }, token);
}

export async function addBookmark(marketId: string, token: string) {
  return apiFetch('/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ marketId }),
  }, token);
}

export async function removeBookmark(bookmarkId: string, token: string) {
  return apiFetch(`/bookmarks/${bookmarkId}`, {
    method: 'DELETE',
  }, token);
}

// --- Markets ---

export async function getMarkets() {
  return apiFetch('/markets', { method: 'GET' });
}

export async function createMarket(data: any, token: string) {
  return apiFetch('/markets', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function getMarketById(id: string) {
  return apiFetch(`/markets/${id}`, { method: 'GET' });
}

export async function updateMarket(id: string, data: any, token: string) {
  return apiFetch(`/markets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
}

export async function deleteMarket(id: string, token: string) {
  return apiFetch(`/markets/${id}`, {
    method: 'DELETE',
  }, token);
}

// --- Orders ---

export async function getOrders(token: string) {
  return apiFetch('/orders', { method: 'GET' }, token);
}

export async function placeOrder(data: any, token: string) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function cancelOrder(orderId: string, token: string) {
  return apiFetch(`/orders/${orderId}/cancel`, {
    method: 'POST',
  }, token);
}

// --- Portfolio ---

export async function getPortfolio(token: string) {
  return apiFetch('/portfolio', { method: 'GET' }, token);
}

// --- Settings ---

export async function getSettings(token: string) {
  return apiFetch('/settings', { method: 'GET' }, token);
}

export async function updateSettings(data: any, token: string) {
  return apiFetch('/settings', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function updateNotificationPreferences(data: any, token: string) {
  return apiFetch('/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token);
}

// --- Transactions ---

export async function getTransactions(token: string, page: number = 1, limit: number = 20, type?: 'deposit' | 'withdrawal' | 'all') {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(type && type !== 'all' ? { type } : {}),
  });
  return apiFetch(`/transactions?${params}`, { method: 'GET' }, token);
}

export async function getTransactionById(id: string, token: string) {
  return apiFetch(`/transactions/${id}`, { method: 'GET' }, token);
}
