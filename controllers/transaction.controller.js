const { blockchain, Transaction } = require('../models');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');
const { isValidAddress, isValidAmount, sanitizeAddress, sanitizeAmount } = require('../utils/validator');
const persistence = require('../services/persistence.service'); // TASK 2: Import persistence service

const addTransaction = (req, res, next) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;

    if (!isValidAddress(fromAddress) || !isValidAddress(toAddress)) {
      return sendError(res, 'Invalid wallet address format', 400);
    }

    if (!isValidAmount(amount)) {
      return sendError(res, 'Amount must be a positive number', 400);
    }

    const transaction = new Transaction(
      sanitizeAddress(fromAddress),
      sanitizeAddress(toAddress),
      sanitizeAmount(amount)
    );

    blockchain.addTransaction(transaction);
    
    // TASK 2: Save blockchain state to disk after adding transaction
    persistence.save(blockchain);

    sendCreated(res, {
      message: 'Transaction added to pending pool',
      transaction,
    });
  } catch (err) {
    next(err);
  }
};

const getPendingTransactions = (req, res) => {
  sendSuccess(res, {
    pendingTransactions: blockchain.pendingTransactions,
    count: blockchain.pendingTransactions.length,
  });
};

const getAllTransactions = (req, res) => {
  const transactions = blockchain.getAllTransactions();
  sendSuccess(res, { transactions, count: transactions.length });
};

// ============================================================================
// TASK 1: Transaction Search & Filtering
// ============================================================================
/**
 * Search and filter transactions across all blocks in the blockchain.
 * All filters are optional - if not provided, that filter is skipped.
 * 
 * @route GET /api/transactions/search
 * @query {string} fromAddress - Partial, case-insensitive match on sender address
 * @query {string} toAddress - Partial, case-insensitive match on recipient address
 * @query {number} minAmount - Minimum transaction amount (inclusive)
 * @query {number} maxAmount - Maximum transaction amount (inclusive)
 * @query {number} startDate - Start timestamp in milliseconds (inclusive)
 * @query {number} endDate - End timestamp in milliseconds (inclusive)
 * @returns {Object} { success: true, results: [...], count: N }
 */
const searchTransactions = (req, res) => {
  try {
    const { fromAddress, toAddress, minAmount, maxAmount, startDate, endDate } = req.query;

    // ── Step 1: Validate all numeric inputs ────────────────────────────────
    // Reject negative amounts and invalid timestamps with clear error messages
    
    if (minAmount !== undefined) {
      const min = parseFloat(minAmount);
      if (isNaN(min) || min < 0) {
        return sendError(res, 'minAmount must be a non-negative number', 400);
      }
    }

    if (maxAmount !== undefined) {
      const max = parseFloat(maxAmount);
      if (isNaN(max) || max < 0) {
        return sendError(res, 'maxAmount must be a non-negative number', 400);
      }
    }

    if (startDate !== undefined) {
      const start = parseInt(startDate, 10);
      if (isNaN(start)) {
        return sendError(res, 'startDate must be a valid timestamp', 400);
      }
    }

    if (endDate !== undefined) {
      const end = parseInt(endDate, 10);
      if (isNaN(end)) {
        return sendError(res, 'endDate must be a valid timestamp', 400);
      }
    }

    // ── Step 2: Flatten all transactions from all blocks ───────────────────
    // This searches across ALL confirmed transactions in the entire blockchain
    const allTransactions = blockchain.chain.flatMap((block) => block.transactions);

    // ── Step 3: Apply filters ───────────────────────────────────────────────
    // Only apply a filter if the query parameter was provided
    const results = allTransactions.filter((tx) => {
      
      // Filter by fromAddress (partial, case-insensitive)
      if (fromAddress && tx.fromAddress) {
        const match = tx.fromAddress.toLowerCase().includes(fromAddress.toLowerCase());
        if (!match) return false;
      }

      // Filter by toAddress (partial, case-insensitive)
      if (toAddress && tx.toAddress) {
        const match = tx.toAddress.toLowerCase().includes(toAddress.toLowerCase());
        if (!match) return false;
      }

      // Filter by minAmount (inclusive)
      if (minAmount !== undefined) {
        if (tx.amount < parseFloat(minAmount)) return false;
      }

      // Filter by maxAmount (inclusive)
      if (maxAmount !== undefined) {
        if (tx.amount > parseFloat(maxAmount)) return false;
      }

      // Filter by startDate (inclusive)
      if (startDate !== undefined) {
        if (tx.timestamp < parseInt(startDate, 10)) return false;
      }

      // Filter by endDate (inclusive)
      if (endDate !== undefined) {
        if (tx.timestamp > parseInt(endDate, 10)) return false;
      }

      return true;
    });

    // Return results with count
    sendSuccess(res, { results, count: results.length });
  } catch (err) {
    sendError(res, 'Failed to search transactions', 500);
  }
};

module.exports = { 
  addTransaction, 
  getPendingTransactions, 
  getAllTransactions,
  searchTransactions 
};
