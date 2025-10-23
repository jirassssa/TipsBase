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

## Telegram Bot Commands

- `/start` - Welcome message & instructions
- `/deposit` - Get deposit address
- `/balance` - Check your balance
- `/tip @username` - Send tip with quick buttons (0.0005 / 0.0015 / 0.005 ETH)
- `/withdraw address amount` - Withdraw to your wallet
- `/stats` - View your statistics
- `/help` - Show help message

## Discord Bot Commands

All commands work in **any server** where the bot is invited:

- `/tip @user` - Send tip with quick buttons (0.0005 / 0.0015 / 0.005 ETH)
- `/balance` - Check your balance
- `/deposit` - Get deposit instructions
- `/withdraw address amount` - Withdraw to your wallet
- `/stats` - View your statistics

## Setup

### Prerequisites

- Node.js v18+
- Telegram Bot Token (from @BotFather)
- Discord Bot Token (from Discord Developer Portal)
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
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
\`\`\`

### Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to "Bot" tab → "Add Bot"
4. Copy the Bot Token
5. Enable these intents:
   - Server Members Intent
   - Message Content Intent (if needed)
6. Go to "OAuth2" → "URL Generator"
7. Select scopes: `bot`, `applications.commands`
8. Select bot permissions: Send Messages, Use Slash Commands
9. Copy the generated URL and invite bot to your servers

### Deploy Contract (Already Deployed)

\`\`\`bash
npm run compile
npm run deploy
\`\`\`

### Run Bots

**Telegram Bot:**
\`\`\`bash
npm run bot
\`\`\`

**Discord Bot:**
\`\`\`bash
npm run bot:discord
\`\`\`

**Web Dashboard:**
\`\`\`bash
npm run dev
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

## Web Dashboard

Access the web dashboard at: http://localhost:3001 (when running locally)

Features:
- 💵 **Deposit ETH** - Add funds to your tip wallet
- 💸 **Withdraw ETH** - Transfer to any address
- 📊 **View Statistics** - Balance, tips sent/received
- 🔗 **Wallet Connect** - Connect with MetaMask, WalletConnect

## Future Improvements

- [ ] Discord bot integration
- [ ] Username -> User ID mapping database
- [ ] Multi-signature security
- [ ] Gas-less transactions (meta-transactions)
- [ ] Reputation system
- [ ] Tip reactions and emoji support

## License

MIT
