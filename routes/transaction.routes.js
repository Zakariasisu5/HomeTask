const { Router } = require('express');
const {
  addTransaction,
  getPendingTransactions,
  getAllTransactions,
  searchTransactions, // TASK 1: New search endpoint
} = require('../controllers/transaction.controller');
const { validateBody } = require('../middleware/validateRequest.middleware');
const { writeLimiter } = require('../middleware/rateLimit.middleware');

const router = Router();

router.post('/', writeLimiter, validateBody(['fromAddress', 'toAddress', 'amount']), addTransaction);
router.get('/pending', getPendingTransactions);
router.get('/all', getAllTransactions);
router.get('/search', searchTransactions); // TASK 1: Search & filter transactions

module.exports = router;
