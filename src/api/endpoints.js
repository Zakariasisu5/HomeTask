const BASE = '/api';

const ENDPOINTS = {
  CHAIN: `${BASE}/chain`,
  CHAIN_VALID: `${BASE}/chain/valid`,
  TRANSACTIONS: `${BASE}/transactions`,
  TRANSACTIONS_PENDING: `${BASE}/transactions/pending`,
  TRANSACTIONS_ALL: `${BASE}/transactions/all`,
  TRANSACTIONS_SEARCH: `${BASE}/transactions/search`, // TASK 1: Search endpoint
  MINE: `${BASE}/mine`,
  STATS: `${BASE}/stats`,
  balance: (address) => `${BASE}/balance/${encodeURIComponent(address)}`,
};

export default ENDPOINTS;
