// ============================================================================
// TASK 1: Transaction Search Component
// ============================================================================
// This component provides a search interface for filtering blockchain transactions.
// Users can search by address (partial match), amount range, and date range.
// All filters are optional and can be combined.
// ============================================================================

import React, { useState } from 'react';
import { searchTransactions } from '../api/blockchain.api';
import './TransactionSearch.css';

const TransactionSearch = () => {
  // ── Form state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    fromAddress: '',
    toAddress: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
  });

  // ── Results state ───────────────────────────────────────────────────────
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Handle input changes ────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ── Handle form submission ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build filters object with only non-empty values
      const filtersToSend = {};
      
      if (filters.fromAddress.trim()) filtersToSend.fromAddress = filters.fromAddress.trim();
      if (filters.toAddress.trim()) filtersToSend.toAddress = filters.toAddress.trim();
      if (filters.minAmount) filtersToSend.minAmount = filters.minAmount;
      if (filters.maxAmount) filtersToSend.maxAmount = filters.maxAmount;
      
      // Convert date inputs to timestamps (milliseconds)
      if (filters.startDate) filtersToSend.startDate = new Date(filters.startDate).getTime();
      if (filters.endDate) filtersToSend.endDate = new Date(filters.endDate).getTime();

      // Call API via the client (no direct fetch)
      const data = await searchTransactions(filtersToSend);
      setResults(data.results);
    } catch (err) {
      setError(err.message || 'Failed to search transactions');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Handle clear button ─────────────────────────────────────────────────
  const handleClear = () => {
    setFilters({
      fromAddress: '',
      toAddress: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
    });
    setResults(null);
    setError(null);
  };

  // ── Format timestamp for display ────────────────────────────────────────
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="transaction-search">
      <h2>Search Transactions</h2>
      
      {/* ── Search Form ────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="search-form">
        
        {/* Address filters */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fromAddress">From Address</label>
            <input
              type="text"
              id="fromAddress"
              name="fromAddress"
              value={filters.fromAddress}
              onChange={handleInputChange}
              placeholder="Partial match..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="toAddress">To Address</label>
            <input
              type="text"
              id="toAddress"
              name="toAddress"
              value={filters.toAddress}
              onChange={handleInputChange}
              placeholder="Partial match..."
            />
          </div>
        </div>

        {/* Amount filters */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minAmount">Min Amount</label>
            <input
              type="number"
              id="minAmount"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxAmount">Max Amount</label>
            <input
              type="number"
              id="maxAmount"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Date filters */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>

      {/* ── Error Display ──────────────────────────────────────────────── */}
      {error && (
        <div className="search-error">
          <p>{error}</p>
        </div>
      )}

      {/* ── Results Display ────────────────────────────────────────────── */}
      {results !== null && (
        <div className="search-results">
          <h3>Results ({results.length})</h3>
          
          {/* No results state */}
          {results.length === 0 ? (
            <p className="no-results">No transactions found matching your criteria.</p>
          ) : (
            /* Results list */
            <div className="results-list">
              {results.map((tx, index) => (
                <div key={index} className="result-item">
                  <div className="result-amount">{tx.amount} coins</div>
                  <div className="result-addresses">
                    <span className="from">{tx.fromAddress || 'Mining Reward'}</span>
                    <span className="arrow">→</span>
                    <span className="to">{tx.toAddress}</span>
                  </div>
                  <div className="result-timestamp">{formatTimestamp(tx.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionSearch;
