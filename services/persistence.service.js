// ============================================================================
// TASK 2: Data Persistence Service
// ============================================================================
// This service handles saving and loading blockchain state to/from disk.
// The blockchain is persisted as JSON in blockchain.json at the project root.
// All file operations are wrapped in try-catch to prevent server crashes.
// ============================================================================

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const STORAGE_FILE = path.join(__dirname, '..', 'blockchain.json');

/**
 * Save blockchain state to disk.
 * Persists the entire chain, pending transactions, difficulty, and mining reward.
 * 
 * @param {Object} blockchain - The blockchain instance to persist
 * @returns {boolean} True if save succeeded, false if it failed
 */
const save = (blockchain) => {
  try {
    // Extract the data we need to persist
    const data = {
      chain: blockchain.chain,
      pendingTransactions: blockchain.pendingTransactions,
      difficulty: blockchain.difficulty,
      miningReward: blockchain.miningReward,
    };

    // Write to disk with pretty formatting (2-space indent)
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
    logger.debug('Blockchain saved to disk');
    return true;
  } catch (err) {
    // Log error but don't crash the server
    logger.error(`Failed to save blockchain: ${err.message}`);
    return false;
  }
};

/**
 * Load blockchain state from disk.
 * Validates the structure and handles missing/corrupt files gracefully.
 * 
 * @returns {Object|null} Blockchain data if valid, null if missing/invalid
 */
const load = () => {
  try {
    // Check if file exists
    if (!fs.existsSync(STORAGE_FILE)) {
      logger.info('No saved blockchain found, starting fresh');
      return null;
    }

    // Read and parse the file
    const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
    const data = JSON.parse(raw);

    // Validate that the structure is correct
    if (!data.chain || !Array.isArray(data.chain)) {
      logger.warn('Invalid blockchain structure in saved file, starting fresh');
      return null;
    }

    if (!data.pendingTransactions || !Array.isArray(data.pendingTransactions)) {
      logger.warn('Invalid pending transactions in saved file, starting fresh');
      return null;
    }

    logger.info(`Loaded blockchain with ${data.chain.length} blocks`);
    return data;
  } catch (err) {
    // Handle JSON parse errors separately for better logging
    if (err instanceof SyntaxError) {
      logger.warn('Corrupt blockchain file (invalid JSON), starting fresh');
    } else {
      logger.error(`Failed to load blockchain: ${err.message}`);
    }
    return null;
  }
};

/**
 * Clear saved blockchain data from disk.
 * Deletes the blockchain.json file if it exists.
 * 
 * @returns {boolean} True if clear succeeded, false if it failed
 */
const clear = () => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE);
      logger.info('Blockchain storage cleared');
    }
    return true;
  } catch (err) {
    logger.error(`Failed to clear blockchain: ${err.message}`);
    return false;
  }
};

module.exports = { save, load, clear };
