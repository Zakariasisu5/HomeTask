import client from './client';
import ENDPOINTS from './endpoints';

export const fetchChain = () => client.get(ENDPOINTS.CHAIN);

export const fetchChainValidity = () => client.get(ENDPOINTS.CHAIN_VALID);

export const fetchStats = () => client.get(ENDPOINTS.STATS);

export const fetchPendingTransactions = () =>
  client.get(ENDPOINTS.TRANSACTIONS_PENDING);

export const fetchAllTransactions = () =>
  client.get(ENDPOINTS.TRANSACTIONS_ALL);

export const addTransaction = (fromAddress, toAddress, amount) =>
  client.post(ENDPOINTS.TRANSACTIONS, { fromAddress, toAddress, amount });

export const mineBlock = (miningRewardAddress = 'miner1') =>
  client.post(ENDPOINTS.MINE, { miningRewardAddress });

export const fetchBalance = (address) =>
  client.get(ENDPOINTS.balance(address));

export const fetchDashboard = () =>
  Promise.all([fetchChain(), fetchStats()]).then(([chainData, statsData]) => ({
    chainData,
    statsData,
  }));

// ============================================================================
// TASK 1: Transaction Search & Filtering
// ============================================================================
/**
 * Search transactions with optional filters.
 * Builds query string from provided filters and calls the search endpoint.
 * 
 * @param {Object} filters - Search filters
 * @param {string} filters.fromAddress - Partial sender address
 * @param {string} filters.toAddress - Partial recipient address
 * @param {number} filters.minAmount - Minimum amount
 * @param {number} filters.maxAmount - Maximum amount
 * @param {number} filters.startDate - Start timestamp (ms)
 * @param {number} filters.endDate - End timestamp (ms)
 * @returns {Promise} API response with results array
 */
export const searchTransactions = (filters) => {
  const params = new URLSearchParams();
  
  // Only add parameters that were provided
  if (filters.fromAddress) params.append('fromAddress', filters.fromAddress);
  if (filters.toAddress) params.append('toAddress', filters.toAddress);
  if (filters.minAmount) params.append('minAmount', filters.minAmount);
  if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const url = queryString ? `${ENDPOINTS.TRANSACTIONS_SEARCH}?${queryString}` : ENDPOINTS.TRANSACTIONS_SEARCH;
  
  return client.get(url);
};
