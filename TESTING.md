# Testing Guide - Base Tip Bot

## 📋 Project Overview

**Base Tip Bot** - Multi-platform tipping system on Base Mainnet
- Telegram Bot
- Discord Bot
- Web Dashboard

## 🔧 Contract Information

**Deployed Contract:** `0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a`
- Network: Base Mainnet (Chain ID: 8453)
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org/address/0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a

**Features:**
- 1% platform fee sent directly to owner
- Custodial wallet system (users don't need wallets to tip)
- Cross-platform tipping (Telegram ↔ Discord)
- Recipient notifications via DM

---

## 🚀 How to Run Locally

### 1. Install Dependencies

```bash
cd /Users/mac/Desktop/basebatch1
npm install
```

### 2. Environment Variables

Create a `.env` file with your own credentials:
```bash
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
```

### 3. Start Services

**Web Dashboard:**
```bash
npm run dev -- --port 3001
```
- Access at: http://localhost:3001
- Features: Deposit ETH, View balance, Withdraw

**Discord Bot:**
```bash
npm run bot:discord
```
- Expected output:
```
✅ Slash commands registered globally
🤖 Discord Tip Bot is ready!
Logged in as Base Tip Bot#9454
Contract: 0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a
Network: Base Mainnet
```

**Telegram Bot:**
```bash
npm run bot
```
- Expected output:
```
🤖 Base Tip Bot is running on Telegram!
Contract: 0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a
Network: Base Mainnet
```

---

## 🧪 Testing Scenarios

### A. Web Dashboard Testing

1. **Open Dashboard**
   ```bash
   open http://localhost:3001
   ```

2. **Connect Wallet**
   - Click "Connect Wallet"
   - Use RainbowKit to connect MetaMask/Coinbase Wallet
   - Ensure you're on Base Mainnet

3. **Deposit ETH**
   - Enter your User ID (e.g., `tg_123456` or `dc_789012`)
   - Enter amount (e.g., `0.01` ETH)
   - Click "Deposit"
   - Confirm transaction in wallet
   - Wait for confirmation

4. **Check Balance**
   - Enter same User ID
   - Click "Check Balance"
   - Should show deposited amount

5. **Withdraw**
   - Enter User ID
   - Enter withdrawal address
   - Enter amount
   - Click "Withdraw"

### B. Discord Bot Testing

1. **Invite Bot to Server**
   - Client ID: `1429824670823092377`
   - Invite URL: (generate with proper permissions)

2. **Test Commands**

   **Check Balance:**
   ```
   /balance
   ```
   - Should show your current balance
   - Response is ephemeral (only you see it)

   **Get Deposit Info:**
   ```
   /deposit
   ```
   - Shows contract address and your User ID (`dc_<your_discord_id>`)

   **Send Tip:**
   ```
   /tip @username
   ```
   - Select amount from buttons (0.0005, 0.0015, 0.005 ETH)
   - Click button to confirm
   - Recipient receives DM notification

   **View Stats:**
   ```
   /stats
   ```
   - Shows balance, total sent, total received

   **Withdraw:**
   ```
   /withdraw address:0x... amount:0.01
   ```
   - Enter Ethereum address
   - Enter amount in ETH
   - Confirms transaction

3. **Expected Flow for Tipping:**
   - User A: `/tip @UserB`
   - Bot shows buttons with amounts
   - User A clicks `0.0005 ETH`
   - Bot processes transaction
   - User A sees confirmation message
   - User B receives DM: "🎉 You received a tip!"

### C. Telegram Bot Testing

1. **Find Bot**
   - Search for your bot using the token
   - Start conversation

2. **Test Commands**

   **Start:**
   ```
   /start
   ```
   - Shows welcome message and commands

   **Balance:**
   ```
   /balance
   ```
   - Shows current balance

   **Deposit:**
   ```
   /deposit
   ```
   - Shows contract address and User ID (`tg_<your_telegram_id>`)

   **Send Tip:**
   ```
   /tip @username
   ```
   - Shows inline keyboard with amount buttons
   - Click to select amount
   - Confirms transaction
   - Recipient gets notification

   **Withdraw:**
   ```
   /withdraw 0x123... 0.01
   ```
   - Format: `/withdraw <address> <amount>`

   **Stats:**
   ```
   /stats
   ```
   - Shows statistics

### D. Smart Contract Testing

**Using Web Dashboard or Hardhat Console:**

```javascript
// Connect to contract
const { ethers } = require('hardhat');
const contract = await ethers.getContractAt(
  'TipBot',
  '0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a'
);

// Check balance
await contract.getBalance('tg_123456');

// Check platform fee
await contract.platformFeePercent(); // Should return 1

// Check owner
await contract.owner(); // Should return your wallet address
```

---

## 🔍 Verification Checklist

### Contract Verification

- [ ] Contract deployed at `0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a`
- [ ] Platform fee is 1%
- [ ] Fee is sent to owner wallet on each tip
- [ ] Owner can withdraw user funds
- [ ] Balances tracked correctly per User ID

### Discord Bot

- [ ] Bot connects successfully
- [ ] Slash commands registered
- [ ] `/balance` works
- [ ] `/deposit` shows correct info
- [ ] `/tip` creates buttons
- [ ] Tip transaction completes
- [ ] Recipient receives DM notification
- [ ] `/withdraw` works
- [ ] `/stats` shows correct data

### Telegram Bot

- [ ] Bot starts and shows "running" message
- [ ] `/start` shows welcome
- [ ] `/balance` works
- [ ] `/deposit` shows info
- [ ] `/tip` shows buttons
- [ ] Tip completes successfully
- [ ] Recipient gets notification
- [ ] `/withdraw` works
- [ ] `/stats` shows data

### Web Dashboard

- [ ] Page loads on localhost:3001
- [ ] Wallet connection works
- [ ] Deposit form works
- [ ] Balance check works
- [ ] Withdraw works
- [ ] Shows correct contract address

---

## 🐛 Common Issues & Solutions

### Issue: Discord Bot Not Starting
**Solution:**
```bash
# Check if slash commands registered
npm run bot:discord

# Look for: "✅ Slash commands registered globally"
```

### Issue: Telegram Bot Silent
**Solution:**
```bash
# Kill and restart
ps aux | grep "node bot/index.js" | grep -v grep
kill <PID>
npm run bot
```

### Issue: Insufficient Balance
**Solution:**
- Deposit ETH via web dashboard first
- Check balance: `/balance`

### Issue: Wrong Network
**Solution:**
- Ensure wallet is on Base Mainnet (Chain ID: 8453)
- RPC: https://mainnet.base.org

### Issue: Transaction Fails
**Solution:**
- Check wallet has enough ETH for gas
- Gas price set to 0.1 Gwei (very low, may be slow)
- Can increase in `hardhat.config.js`

---

## 📊 Monitoring

### Check Running Processes

```bash
# All running bots and servers
ps aux | grep node | grep -E "bot|dev"
```

### Check Logs

**Discord Bot:**
```bash
# View background process output
# (Use the bash ID from when you started it)
```

**Telegram Bot:**
```bash
# Same as above
```

### Check Contract on BaseScan

Visit: https://basescan.org/address/0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a

- View transactions
- Check contract balance
- Verify fee transfers to owner

---

## 📝 Test User IDs

**Format:**
- Telegram: `tg_<telegram_user_id>`
- Discord: `dc_<discord_user_id>`

**Example:**
- Telegram user ID 123456 → `tg_123456`
- Discord user ID 987654321098765432 → `dc_987654321098765432`

---

## 🎯 End-to-End Test Scenario

1. **User A deposits 0.01 ETH via web dashboard**
   - User A's ID: `dc_111111`
   - Check balance: should show 0.01 ETH

2. **User A tips User B 0.005 ETH via Discord**
   - `/tip @UserB`
   - Click `0.005 ETH` button
   - Transaction completes

3. **Verify:**
   - User A balance: 0.01 - 0.005 = 0.005 ETH
   - User B balance: 0.00495 ETH (0.005 - 1% fee)
   - Owner receives: 0.00005 ETH (1% of 0.005)
   - User B gets DM notification

4. **User B withdraws via Telegram**
   - `/withdraw 0x... 0.004`
   - Transaction completes
   - User B balance: 0.00095 ETH remaining

5. **Check stats:**
   - User A: sent 0.005 ETH total
   - User B: received 0.00495 ETH total

---

## 🔗 Important Links

- **Contract:** https://basescan.org/address/0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a
- **Base Mainnet:** https://mainnet.base.org
- **Base Faucet:** (for testnet only)
- **Local Dashboard:** http://localhost:3001

---

## 💡 Tips

- Always test with small amounts first (0.0005 ETH)
- Keep enough ETH in bot wallet for gas fees
- Monitor owner wallet for fee collection
- Check BaseScan for transaction confirmations
- Use ephemeral commands in Discord to keep channels clean
- Telegram notifications go to DMs automatically
