const { Telegraf } = require('telegraf');
const { ethers } = require('ethers');
require('dotenv').config();

const TipBotABI = require('./TipBot.json');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = 'https://mainnet.base.org';

// Initialize
const bot = new Telegraf(BOT_TOKEN);
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, TipBotABI.abi, wallet);

// Helper functions
function getUserId(ctx) {
  return `tg_${ctx.from.id}`;
}

function formatETH(wei) {
  return ethers.formatEther(wei);
}

function parseETH(eth) {
  return ethers.parseEther(eth);
}

// Commands

// /start
bot.start((ctx) => {
  ctx.reply(
    `🤖 Welcome to Base Tip Bot!\n\n` +
    `Send ETH tips to friends on Telegram using Base blockchain.\n\n` +
    `Commands:\n` +
    `/deposit - Get deposit address\n` +
    `/balance - Check your balance\n` +
    `/tip @username amount - Send tip (e.g., /tip @alice 0.001)\n` +
    `/withdraw address amount - Withdraw to your wallet\n` +
    `/stats - View your statistics\n` +
    `/help - Show this message\n\n` +
    `Platform fee: 1% per tip`
  );
});

// /help
bot.help((ctx) => {
  ctx.reply(
    `📖 Base Tip Bot Help\n\n` +
    `Commands:\n` +
    `/deposit - Get deposit address\n` +
    `/balance - Check your balance\n` +
    `/tip @username amount - Send tip\n` +
    `/withdraw address amount - Withdraw funds\n` +
    `/stats - View statistics\n\n` +
    `Examples:\n` +
    `/tip @alice 0.001 - Tip 0.001 ETH to @alice\n` +
    `/withdraw 0x123... 0.01 - Withdraw 0.01 ETH\n\n` +
    `Need help? Contact @yourhandle`
  );
});

// /deposit
bot.command('deposit', async (ctx) => {
  const userId = getUserId(ctx);

  ctx.reply(
    `💰 Deposit ETH to your tip wallet:\n\n` +
    `Contract: \`${CONTRACT_ADDRESS}\`\n\n` +
    `Your User ID: \`${userId}\`\n\n` +
    `To deposit, send ETH to the contract address and call the \`deposit\` function with your user ID.\n\n` +
    `Or visit the web dashboard for easy deposit.`,
    { parse_mode: 'Markdown' }
  );
});

// /balance
bot.command('balance', async (ctx) => {
  try {
    const userId = getUserId(ctx);
    const balance = await contract.getBalance(userId);

    ctx.reply(
      `💵 Your Balance\n\n` +
      `${formatETH(balance)} ETH\n\n` +
      `Use /deposit to add funds\n` +
      `Use /tip to send tips`
    );
  } catch (error) {
    console.error('Balance error:', error);
    ctx.reply('❌ Error fetching balance. Please try again.');
  }
});

// /tip
bot.command('tip', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length < 2) {
      return ctx.reply('❌ Usage: /tip @username amount\nExample: /tip @alice 0.001');
    }

    const recipient = args[0].replace('@', '');
    const amount = args[1];

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return ctx.reply('❌ Invalid amount. Please use a positive number.');
    }

    // Check if recipient exists by mentioning them
    // In production, you'd need to track user IDs

    const fromUserId = getUserId(ctx);
    const toUserId = `tg_${recipient}`; // Simplified - in production, look up by username
    const amountWei = parseETH(amount);

    // Check balance
    const balance = await contract.getBalance(fromUserId);
    if (balance < amountWei) {
      return ctx.reply(`❌ Insufficient balance. You have ${formatETH(balance)} ETH.`);
    }

    ctx.reply('⏳ Processing tip...');

    // Send tip transaction
    const tx = await contract.tip(fromUserId, toUserId, amountWei);
    await tx.wait();

    const fee = (parseFloat(amount) * 0.01).toFixed(6);
    const afterFee = (parseFloat(amount) * 0.99).toFixed(6);

    ctx.reply(
      `✅ Tip sent!\n\n` +
      `To: @${recipient}\n` +
      `Amount: ${amount} ETH\n` +
      `Fee: ${fee} ETH (1%)\n` +
      `Received: ${afterFee} ETH\n\n` +
      `Transaction: https://basescan.org/tx/${tx.hash}`
    );
  } catch (error) {
    console.error('Tip error:', error);
    ctx.reply('❌ Error sending tip. Please try again.');
  }
});

// /withdraw
bot.command('withdraw', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length < 2) {
      return ctx.reply('❌ Usage: /withdraw address amount\nExample: /withdraw 0x123... 0.01');
    }

    const address = args[0];
    const amount = args[1];

    if (!ethers.isAddress(address)) {
      return ctx.reply('❌ Invalid Ethereum address.');
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return ctx.reply('❌ Invalid amount.');
    }

    const userId = getUserId(ctx);
    const amountWei = parseETH(amount);

    // Check balance
    const balance = await contract.getBalance(userId);
    if (balance < amountWei) {
      return ctx.reply(`❌ Insufficient balance. You have ${formatETH(balance)} ETH.`);
    }

    ctx.reply('⏳ Processing withdrawal...');

    // Withdraw
    const tx = await contract.withdraw(userId, address, amountWei);
    await tx.wait();

    ctx.reply(
      `✅ Withdrawal successful!\n\n` +
      `Amount: ${amount} ETH\n` +
      `To: \`${address}\`\n\n` +
      `Transaction: https://basescan.org/tx/${tx.hash}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Withdraw error:', error);
    ctx.reply('❌ Error processing withdrawal. Please try again.');
  }
});

// /stats
bot.command('stats', async (ctx) => {
  try {
    const userId = getUserId(ctx);
    const stats = await contract.getStats(userId);

    ctx.reply(
      `📊 Your Statistics\n\n` +
      `Balance: ${formatETH(stats[0])} ETH\n` +
      `Total Tips Sent: ${formatETH(stats[1])} ETH\n` +
      `Total Tips Received: ${formatETH(stats[2])} ETH\n\n` +
      `Keep tipping! 💰`
    );
  } catch (error) {
    console.error('Stats error:', error);
    ctx.reply('❌ Error fetching statistics. Please try again.');
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An error occurred. Please try again later.');
});

// Launch bot
bot.launch().then(() => {
  console.log('🤖 Base Tip Bot is running on Telegram!');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('Network: Base Mainnet');
}).catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
