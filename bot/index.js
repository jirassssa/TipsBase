const { Telegraf, Markup } = require('telegraf');
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

// Store pending tips (in production, use Redis/Database)
const pendingTips = new Map();

// Store username to numeric ID mapping (in production, use database)
const usernameToId = new Map();

// Helper functions
function getUserId(ctx) {
  // Support both username and ID
  // If user has username, use @username, otherwise use tg_id
  if (ctx.from.username) {
    // Store mapping for notifications
    usernameToId.set(ctx.from.username.toLowerCase(), ctx.from.id);
    return `@${ctx.from.username}`;
  }
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
  const userId = getUserId(ctx);
  ctx.reply(
    `🤖 Welcome to Base Tip Bot!\n\n` +
    `Send ETH tips to friends on Telegram using Base blockchain.\n\n` +
    `Commands:\n` +
    `/deposit - Get deposit address\n` +
    `/balance - Check your balance\n` +
    `/tip @username - Send tip with quick buttons\n` +
    `/withdraw address amount - Withdraw to your wallet\n` +
    `/stats - View your statistics\n` +
    `/help - Show this message\n\n` +
    `Your User ID: \`${userId}\`\n\n` +
    `Platform fee: 1% per tip`,
    { parse_mode: 'Markdown' }
  );
});

// /help
bot.help((ctx) => {
  ctx.reply(
    `📖 Base Tip Bot Help\n\n` +
    `Commands:\n` +
    `/deposit - Get deposit address\n` +
    `/balance - Check your balance\n` +
    `/tip @username - Send tip (use buttons to select amount)\n` +
    `/withdraw address amount - Withdraw funds\n` +
    `/stats - View statistics\n\n` +
    `Examples:\n` +
    `/tip @alice - Then select amount from buttons\n` +
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

// /tip with buttons or direct amount
bot.command('tip', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length < 1) {
      return ctx.reply('❌ Usage: /tip @username [amount]\nExample: /tip @alice\nOr: /tip @alice 0.00000001');
    }

    const recipient = args[0].replace('@', '');
    const amount = args[1]; // Optional amount

    const userId = getUserId(ctx);
    const balance = await contract.getBalance(userId);

    // If amount is provided, send tip directly
    if (amount) {
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        return ctx.reply('❌ Invalid amount. Please enter a valid number.');
      }

      const amountWei = parseETH(amount);

      if (balance < amountWei) {
        return ctx.reply(`❌ Insufficient balance. You have ${formatETH(balance)} ETH.`);
      }

      const processingMsg = await ctx.reply('⏳ Processing tip...');

      // Send tip transaction
      const tx = await contract.tip(userId, `@${recipient}`, amountWei);
      await tx.wait();

      const fee = (parseFloat(amount) * 0.01).toFixed(8);
      const afterFee = (parseFloat(amount) * 0.99).toFixed(8);

      // Notify sender
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        null,
        `✅ Tip sent!\n\n` +
        `To: @${recipient}\n` +
        `Amount: ${amount} ETH\n` +
        `Fee: ${fee} ETH (1%)\n` +
        `Received: ${afterFee} ETH\n\n` +
        `Transaction: https://basescan.org/tx/${tx.hash}`
      );

      // Notify recipient
      try {
        const recipientUsername = recipient.toLowerCase();
        const recipientNumericId = usernameToId.get(recipientUsername);

        if (recipientNumericId) {
          await bot.telegram.sendMessage(
            recipientNumericId,
            `🎉 You received a tip!\n\n` +
            `From: ${ctx.from.username ? '@' + ctx.from.username : 'Anonymous'}\n` +
            `Amount: ${afterFee} ETH\n` +
            `Your User ID: \`@${recipient}\`\n\n` +
            `💰 Your new balance includes this tip!\n\n` +
            `To check balance: /balance\n` +
            `To withdraw: /withdraw <address> <amount>\n\n` +
            `Transaction: https://basescan.org/tx/${tx.hash}`,
            { parse_mode: 'Markdown' }
          );
        }
      } catch (notifyError) {
        console.error('Failed to notify recipient:', notifyError);
      }

      return;
    }

    // No amount provided, show quick tip buttons
    const pendingId = `${ctx.from.id}_${Date.now()}`;
    pendingTips.set(pendingId, {
      fromUserId: userId,
      fromNumericId: ctx.from.id,
      toUserId: `@${recipient}`,  // Use @username format
      recipient: recipient
    });

    ctx.reply(
      `💰 Send tip to @${recipient}\n\n` +
      `Your balance: ${formatETH(balance)} ETH\n\n` +
      `Select amount or use: /tip @${recipient} <amount>`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('0.0005 ETH', `tip_${pendingId}_0.0005`),
          Markup.button.callback('0.0015 ETH', `tip_${pendingId}_0.0015`)
        ],
        [
          Markup.button.callback('0.005 ETH', `tip_${pendingId}_0.005`),
          Markup.button.callback('Custom', `tip_${pendingId}_custom`)
        ]
      ])
    );
  } catch (error) {
    console.error('Tip command error:', error);
    ctx.reply('❌ Error. Please try again.');
  }
});

// Handle tip button callbacks
bot.action(/^tip_(.+)_(.+)$/, async (ctx) => {
  try {
    const pendingId = ctx.match[1];
    const amountStr = ctx.match[2];

    if (!pendingTips.has(pendingId)) {
      return ctx.answerCbQuery('❌ Tip expired. Please use /tip again.');
    }

    const tipInfo = pendingTips.get(pendingId);

    if (amountStr === 'custom') {
      ctx.answerCbQuery();
      return ctx.reply(
        `Enter custom amount:\n\n` +
        `Reply with: /tipamount <amount>\n` +
        `Example: /tipamount 0.002\n\n` +
        `Recipient: @${tipInfo.recipient}`
      );
    }

    const amount = amountStr;
    const amountWei = parseETH(amount);

    // Check balance
    const balance = await contract.getBalance(tipInfo.fromUserId);
    if (balance < amountWei) {
      ctx.answerCbQuery(`❌ Insufficient balance`);
      return ctx.reply(`❌ Insufficient balance. You have ${formatETH(balance)} ETH.`);
    }

    ctx.answerCbQuery('⏳ Processing...');
    ctx.reply('⏳ Processing tip...');

    // Send tip transaction
    const tx = await contract.tip(tipInfo.fromUserId, tipInfo.toUserId, amountWei);
    await tx.wait();

    const fee = (parseFloat(amount) * 0.01).toFixed(6);
    const afterFee = (parseFloat(amount) * 0.99).toFixed(6);

    // Clean up
    pendingTips.delete(pendingId);

    // Notify sender
    ctx.reply(
      `✅ Tip sent!\n\n` +
      `To: @${tipInfo.recipient}\n` +
      `Amount: ${amount} ETH\n` +
      `Fee: ${fee} ETH (1%)\n` +
      `Received: ${afterFee} ETH\n\n` +
      `Transaction: https://basescan.org/tx/${tx.hash}`
    );

    // Notify recipient
    try {
      // Get numeric ID from username mapping
      const recipientUsername = tipInfo.recipient.toLowerCase();
      const recipientNumericId = usernameToId.get(recipientUsername);

      if (recipientNumericId) {
        await bot.telegram.sendMessage(
          recipientNumericId,
          `🎉 You received a tip!\n\n` +
          `From: ${ctx.from.username ? '@' + ctx.from.username : 'Anonymous'}\n` +
          `Amount: ${afterFee} ETH\n` +
          `Your User ID: \`${tipInfo.toUserId}\`\n\n` +
          `💰 Your new balance includes this tip!\n\n` +
          `To check balance: /balance\n` +
          `To withdraw: /withdraw <address> <amount>\n\n` +
          `Transaction: https://basescan.org/tx/${tx.hash}`,
          { parse_mode: 'Markdown' }
        );
      } else {
        console.log(`Could not notify @${tipInfo.recipient} - not in username mapping yet`);
      }
    } catch (notifyError) {
      console.error('Failed to notify recipient:', notifyError);
      // Don't fail the whole transaction if notification fails
    }
  } catch (error) {
    console.error('Tip callback error:', error);
    ctx.answerCbQuery('❌ Error');
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
