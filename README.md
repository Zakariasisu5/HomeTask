# Full Stack HomeTask Project

A blockchain-based application with a layered Express backend and a React frontend.

> **For Applicants:** See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for task requirements (2 tasks, 4–6 hours).
> See [SETUP.md](./SETUP.md) for a quick-start guide.

---

## Project Structure

```
hometask-blockchain/
│
├── config/
│   └── index.js                  # Environment config (port, CORS, blockchain settings)
│
├── models/
│   ├── blockchain.js             # Block, Transaction, Blockchain domain classes
│   └── index.js                  # Singleton instance + demo data seeding
│
├── utils/
│   ├── logger.js                 # Levelled logger (error / warn / info / debug)
│   ├── response.js               # Unified sendSuccess / sendCreated / sendError helpers
│   └── validator.js              # isValidAddress, isValidAmount, sanitizers
│
├── middleware/
│   ├── cors.middleware.js        # CORS policy
│   ├── logger.middleware.js      # Morgan HTTP request logger
│   ├── errorHandler.middleware.js# Centralised error handler (must be last)
│   ├── notFound.middleware.js    # 404 handler
│   ├── validateRequest.middleware.js  # validateBody / validateParams factories
│   └── rateLimit.middleware.js   # apiLimiter (100 req/min) + writeLimiter (20 req/min)
│
├── routes/
│   ├── index.js                  # Aggregates all /api sub-routes
│   ├── blockchain.routes.js      # /api/chain
│   ├── transaction.routes.js     # /api/transactions
│   ├── mining.routes.js          # /api/mine
│   ├── balance.routes.js         # /api/balance
│   ├── stats.routes.js           # /api/stats
│   └── health.routes.js          # /health (no rate limit)
│
├── controllers/
│   ├── blockchain.controller.js
│   ├── transaction.controller.js
│   ├── mining.controller.js
│   ├── balance.controller.js
│   └── stats.controller.js
│
├── src/                          # React frontend
│   ├── api/
│   │   ├── client.js             # Axios instance with request/response interceptors
│   │   ├── endpoints.js          # All API URL constants
│   │   └── blockchain.api.js     # Typed fetch functions (fetchChain, addTransaction…)
│   ├── hooks/
│   │   ├── useBlockchain.js      # Polls /api/chain + /api/stats, returns state
│   │   └── usePolling.js         # Reusable interval-based polling hook
│   ├── utils/
│   │   ├── formatters.js         # truncateHash, formatTimestamp, formatAmount
│   │   └── helpers.js            # isPositiveNumber, groupTransactionsByBlock, etc.
│   ├── constants/
│   │   └── index.js              # POLL_INTERVAL_MS, DEFAULT_MINER_ADDRESS, enums
│   ├── components/
│   │   ├── BlockchainViewer.js
│   │   ├── TransactionForm.js
│   │   ├── StatsPanel.js
│   │   ├── Header.js
│   │   └── ErrorBoundary.js      # React class error boundary
│   ├── App.js
│   └── index.js
│
├── blockchain.js                 # Backward-compat re-export → models/blockchain.js
├── server.js                     # Entry point — wires middleware, routes, starts server
├── .env.example                  # Template for environment variables
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm

### Install & Configure

```bash
npm install
cp .env.example .env   # then edit .env if you need different ports
```

### Run in Development

```bash
# Terminal 1 — React dev server on http://localhost:3000
npm start

# Terminal 2 — API server on http://localhost:3002, with auto-reload
npm run dev
```

The React app proxies all `/api/*` requests to the API server automatically via `src/setupProxy.js`.

### Run in Production

```bash
npm run serve   # builds the React app, then serves everything from port 3002
```

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` or `production` |
| `PORT` | `3002` | API server port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `BLOCKCHAIN_DIFFICULTY` | `2` | Proof-of-work difficulty |
| `BLOCKCHAIN_MINING_REWARD` | `100` | Coinbase reward per mined block |
| `INITIAL_MINER_ADDRESS` | `genesis-miner` | Address for the first demo block reward |
| `SEED_DEMO_DATA` | `true` | Set to `false` to start with an empty chain |
| `REACT_APP_API_URL` | `http://localhost:3002` | Used by the React app |

---

## API Reference

All API responses share a common envelope:

```json
{ "success": true, ...payload }
{ "success": false, "error": "message" }
```

### Chain

| Method | Path | Description |
|---|---|---|
| GET | `/api/chain` | Full chain + length |
| GET | `/api/chain/valid` | `{ isValid: bool }` |

### Transactions

| Method | Path | Description |
|---|---|---|
| POST | `/api/transactions` | Add a pending transaction |
| GET | `/api/transactions/pending` | All pending transactions |
| GET | `/api/transactions/all` | All confirmed transactions |

**POST `/api/transactions` body:**
```json
{ "fromAddress": "address1", "toAddress": "address2", "amount": 100 }
```

### Mining

| Method | Path | Description |
|---|---|---|
| POST | `/api/mine` | Mine pending transactions into a new block |

**POST `/api/mine` body:**
```json
{ "miningRewardAddress": "miner1" }
```

### Balance

| Method | Path | Description |
|---|---|---|
| GET | `/api/balance/:address` | Confirmed balance of an address |

### Stats

| Method | Path | Description |
|---|---|---|
| GET | `/api/stats` | Chain length, difficulty, validity, pending count |

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Server uptime, env, timestamp — no rate limit |

---

## Frontend Architecture

The React app is organised into distinct concerns:

- **`src/api/`** — all network calls live here. Components never call `fetch`/`axios` directly.
- **`src/hooks/useBlockchain`** — single source of truth for chain + stats state; polls every 5 s.
- **`src/utils/formatters`** — pure formatting functions (hash truncation, timestamps, amounts).
- **`src/constants/`** — magic strings and numbers in one place.
- **`ErrorBoundary`** — catches any unhandled React render errors gracefully.

---

## Technologies

### Backend
- Node.js + Express
- `morgan` — HTTP request logging
- `dotenv` — environment variable loading
- `express-rate-limit` — API rate limiting
- `cors` — CORS policy middleware
- Node.js built-in `crypto` — SHA-256 hashing

### Frontend
- React 18
- Axios (with interceptors)
- CSS3 (glassmorphism, gradients, animations)

---

## Troubleshooting

**Port already in use**
```bash
# Use a different port
PORT=3003 npm run dev
```

**Frontend can't reach the API**
- Confirm `npm run dev` is running on port 3002
- Check `REACT_APP_API_URL` in your `.env`
- Confirm `src/setupProxy.js` target matches `PORT`

**Chain resets on every restart**
- This is expected until you implement Task 2 (Data Persistence) from INSTRUCTIONS.md

---

## License

MIT — for learning and assessment purposes.

---

## Changes

### Task 1: Transaction Search & Filtering

**Backend Changes:**
- Added `GET /api/transactions/search` endpoint in `routes/transaction.routes.js`
- Implemented `searchTransactions` controller in `controllers/transaction.controller.js`
  - Accepts optional query parameters: `fromAddress`, `toAddress`, `minAmount`, `maxAmount`, `startDate`, `endDate`
  - Validates all numeric inputs (amounts must be non-negative, timestamps must be valid)
  - Returns 400 for invalid inputs with descriptive error messages
  - Searches across all confirmed transactions in all blocks using `blockchain.chain.flatMap()`
  - Applies partial, case-insensitive matching for addresses
  - Returns `{ results: [...], count: N }` format using existing response helpers

**Frontend Changes:**
- Created `TransactionSearch` component (`src/components/TransactionSearch.js`)
  - Form with 6 input fields matching all backend filter parameters
  - Submit button triggers API call via `src/api/blockchain.api.js` client
  - Loading state during search
  - "No results" message when search returns empty array
  - Results list displays: amount, from → to addresses, timestamp
  - Clear button resets form and results
  - No direct fetch calls — uses API client layer
- Added `searchTransactions` function to `src/api/blockchain.api.js`
- Added `TRANSACTIONS_SEARCH` endpoint to `src/api/endpoints.js`
- Wired `TransactionSearch` component into `App.js` in the left panel

**Trade-offs:**
- Search is performed in-memory on the full chain, which is acceptable for small chains but would need indexing/database for production scale
- Partial address matching uses simple `includes()` rather than regex for simplicity and safety
- Date inputs use browser's native `datetime-local` for simplicity (no date picker library)

### Task 2: Data Persistence

**Backend Changes:**
- Created `services/persistence.service.js` with three functions:
  - `save(blockchain)` — writes chain + pending transactions to `blockchain.json`
  - `load()` — reads from disk on startup, validates structure, handles missing/corrupt files gracefully
  - `clear()` — deletes saved file
- Modified `models/index.js` to load saved blockchain on startup
  - If file exists and is valid, restores chain and pending transactions
  - If file is missing, corrupt, or invalid structure, logs warning and starts fresh
  - Never crashes server — all file errors are caught and logged
- Integrated persistence into controllers:
  - `controllers/transaction.controller.js` — calls `persistence.save()` after adding transaction
  - `controllers/mining.controller.js` — calls `persistence.save()` after mining block
- All file operations use `utils/logger` for consistent logging

**Integration Points:**
- Startup: `models/index.js` calls `persistence.load()` before creating blockchain instance
- After transaction: `addTransaction` controller saves state
- After mining: `mineBlock` controller saves state

**Trade-offs:**
- Synchronous file I/O (`fs.writeFileSync`, `fs.readFileSync`) is used for simplicity — acceptable for small chains but would need async operations for production
- Saves entire blockchain on every change — inefficient for large chains, but simple and reliable for this use case
- No file locking mechanism — assumes single server instance
- JSON format is human-readable but less efficient than binary formats
- No backup/versioning — overwrites file on each save

**Error Handling:**
- All file operations wrapped in try-catch blocks
- Corrupt JSON triggers warning and fresh start (never crashes)
- Invalid structure triggers warning and fresh start
- Missing file is treated as normal first-run scenario
- All errors logged with descriptive messages using existing logger utility

