# Base Tip Bot 💰

Send ETH tips on Telegram using Base blockchain with instant, low-cost transactions.

## Features

- 🤖 **Telegram Bot Integration** - Tip users directly in Telegram
- ⚡ **Base Blockchain** - Fast & cheap transactions
- 💵 **Custodial Wallets** - Simple user experience, no MetaMask required
- 📊 **Statistics Tracking** - Monitor tips sent & received
- 🔒 **1% Platform Fee** - Sustainable & fair

## Smart Contract

**Address:** `0x62264D8aEA99df1D27d3345C743980a90b869850`
**Network:** Base Mainnet (Chain ID: 8453)
**View on BaseScan:** https://basescan.org/address/0x62264D8aEA99df1D27d3345C743980a90b869850

## Bot Commands

- `/start` - Welcome message & instructions
- `/deposit` - Get deposit address
- `/balance` - Check your balance
- `/tip @username amount` - Send tip (e.g., `/tip @alice 0.001`)
- `/withdraw address amount` - Withdraw to your wallet
- `/stats` - View your statistics
- `/help` - Show help message

## Setup

### Prerequisites

- Node.js v18+
- Telegram Bot Token (from @BotFather)
- Private key with ETH on Base Mainnet

### Installation

\`\`\`bash
npm install
\`\`\`

### Configuration

Create `.env` file:

\`\`\`
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0x62264D8aEA99df1D27d3345C743980a90b869850
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
\`\`\`

### Deploy Contract (Already Deployed)

\`\`\`bash
npm run compile
npm run deploy
\`\`\`

### Run Bot

\`\`\`bash
npm run bot
\`\`\`

## How It Works

1. **Deposit** - Users deposit ETH to the contract with their Telegram user ID
2. **Tip** - Send tips to other users using `/tip @username amount`
3. **Withdraw** - Withdraw balance anytime to any address
4. **Track** - View statistics of all tips sent and received

## Architecture

- **Smart Contract** - Manages user balances, tips, and withdrawals
- **Telegram Bot** - Provides user interface via Telegram
- **Base Blockchain** - Low-cost, fast Ethereum L2

## Security

- ⚠️ **Custodial System** - Bot operator holds private key
- ✅ **Open Source** - Smart contract is verified and auditable
- ✅ **1% Fee Cap** - Maximum 5% fee hardcoded in contract

## Platform Fee

- **1% per tip** goes to platform
- Used for bot hosting and development

## Built For

**Base Batches - Builder Track**
Submission by Kokaew Thaweechotwatcharakul

## Tech Stack

- Solidity 0.8.20
- Hardhat
- Ethers.js v6
- Telegraf (Telegram Bot Framework)
- Base Mainnet

## Future Improvements

- [ ] Discord bot integration
- [ ] Web dashboard for deposits/withdrawals
- [ ] Username -> User ID mapping database
- [ ] Multi-signature security
- [ ] Gas-less transactions (meta-transactions)
- [ ] Reputation system
- [ ] Tip reactions and emoji support

## License

MIT
