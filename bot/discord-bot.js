const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes } = require('discord.js');
const { ethers } = require('ethers');
require('dotenv').config();

const TipBotABI = require('./TipBot.json');

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = 'https://mainnet.base.org';

// Initialize blockchain
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, TipBotABI.abi, wallet);

// Store pending tips
const pendingTips = new Map();

// Store username to numeric ID mapping
const usernameToId = new Map();

// Helper functions
function getUserId(user) {
  // Use Discord username (not display name)
  // Support both old (#username) and new (username) formats
  // Always normalize to format without # prefix
  if (user.username) {
    const normalizedUsername = user.username.toLowerCase().replace(/^#/, '');
    // Store mapping for notifications
    usernameToId.set(normalizedUsername, user.id);
    return normalizedUsername;
  }
  return `dc_${user.id}`;
}

// Helper to normalize username from user input
function normalizeUsername(username) {
  return username.toLowerCase().replace(/^#/, '');
}

function formatETH(wei) {
  return ethers.formatEther(wei);
}

function parseETH(eth) {
  return ethers.parseEther(eth);
}

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('tip')
    .setDescription('Send ETH tip to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to tip')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('amount')
        .setDescription('Amount in ETH (optional, or use quick buttons)')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your tip wallet balance'),
  new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Get deposit instructions'),
  new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw ETH from your tip wallet')
    .addStringOption(option =>
      option.setName('address')
        .setDescription('Ethereum address to withdraw to')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('amount')
        .setDescription('Amount in ETH')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View your tip statistics'),
].map(command => command.toJSON());

// Register commands
async function registerCommands() {
  try {
    console.log('Registering Discord slash commands...');
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    await rest.put(
      Routes.applicationCommands(DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Slash commands registered globally');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

client.once('ready', () => {
  console.log('🤖 Discord Tip Bot is ready!');
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Network: Base Mainnet`);
  console.log(`Bot is in ${client.guilds.cache.size} servers`);
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  try {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;

      if (commandName === 'balance') {
        await handleBalance(interaction);
      } else if (commandName === 'deposit') {
        await handleDeposit(interaction);
      } else if (commandName === 'tip') {
        await handleTip(interaction);
      } else if (commandName === 'withdraw') {
        await handleWithdraw(interaction);
      } else if (commandName === 'stats') {
        await handleStats(interaction);
      }
    }

    // Handle button clicks
    if (interaction.isButton()) {
      await handleButtonClick(interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    const reply = { content: '❌ An error occurred. Please try again.', ephemeral: true };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Command handlers

async function handleBalance(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const userId = getUserId(interaction.user);
  const balance = await contract.getBalance(userId);

  await interaction.editReply({
    content: `💵 **Your Balance**\n\n${formatETH(balance)} ETH\n\nUse \`/deposit\` to add funds\nUse \`/tip\` to send tips`
  });
}

async function handleDeposit(interaction) {
  const userId = getUserId(interaction.user);

  await interaction.reply({
    content:
      `💰 **Deposit ETH to your tip wallet**\n\n` +
      `**Contract:** \`${CONTRACT_ADDRESS}\`\n` +
      `**Your User ID:** \`${userId}\`\n\n` +
      `To deposit, send ETH to the contract and call the \`deposit\` function with your user ID.\n\n` +
      `Or visit the web dashboard for easy deposit.`,
    ephemeral: true
  });
}

async function handleTip(interaction) {
  const recipient = interaction.options.getUser('user');
  const customAmount = interaction.options.getNumber('amount');

  if (recipient.id === interaction.user.id) {
    return interaction.reply({ content: '❌ You cannot tip yourself!', ephemeral: true });
  }

  if (recipient.bot) {
    return interaction.reply({ content: '❌ You cannot tip bots!', ephemeral: true });
  }

  const userId = getUserId(interaction.user);
  const balance = await contract.getBalance(userId);

  // If amount is provided, send tip directly
  if (customAmount !== null && customAmount !== undefined) {
    if (customAmount <= 0) {
      return interaction.reply({ content: '❌ Amount must be greater than 0.', ephemeral: true });
    }

    // Convert to fixed notation to avoid scientific notation (1e-8)
    const amountStr = customAmount.toFixed(18).replace(/\.?0+$/, '');
    const amountWei = parseETH(amountStr);

    if (balance < amountWei) {
      return interaction.reply({ content: `❌ Insufficient balance. You have ${formatETH(balance)} ETH.`, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: false });
    await interaction.editReply({ content: '⏳ Processing tip...' });

    // Send tip transaction
    const tx = await contract.tip(userId, getUserId(recipient), amountWei);
    await tx.wait();

    const fee = (customAmount * 0.01).toFixed(8);
    const afterFee = (customAmount * 0.99).toFixed(8);

    // Notify sender
    await interaction.editReply({
      content:
        `✅ **Tip sent!**\n\n` +
        `From: ${interaction.user.username}\n` +
        `To: ${recipient.username}\n` +
        `Amount: ${customAmount} ETH\n` +
        `Fee: ${fee} ETH (1%)\n` +
        `Received: ${afterFee} ETH\n\n` +
        `Transaction: https://basescan.org/tx/${tx.hash}`
    });

    // Notify recipient via DM
    try {
      const recipientUsername = recipient.username?.toLowerCase();
      const recipientNumericId = usernameToId.get(recipientUsername);

      if (recipientNumericId) {
        const recipientUser = await client.users.fetch(recipientNumericId);

        await recipientUser.send(
          `🎉 **You received a tip!**\n\n` +
          `From: ${interaction.user.username}\n` +
          `Amount: ${afterFee} ETH\n` +
          `Your User ID: \`${getUserId(recipient)}\`\n\n` +
          `💰 Your new balance includes this tip!\n\n` +
          `To check balance: \`/balance\`\n` +
          `To withdraw: \`/withdraw <address> <amount>\`\n\n` +
          `Transaction: https://basescan.org/tx/${tx.hash}`
        );
      }
    } catch (notifyError) {
      console.error('Failed to notify recipient:', notifyError);
    }

    return;
  }

  // No amount provided, show quick tip buttons
  const pendingId = `${interaction.user.id}_${Date.now()}`;
  pendingTips.set(pendingId, {
    fromUserId: userId,
    toUserId: getUserId(recipient),
    fromUsername: interaction.user.username,
    toUsername: recipient.username
  });

  // Create buttons
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`tip_${pendingId}_0.0005`)
        .setLabel('0.0005 ETH')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`tip_${pendingId}_0.0015`)
        .setLabel('0.0015 ETH')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`tip_${pendingId}_0.005`)
        .setLabel('0.005 ETH')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`tip_${pendingId}_custom`)
        .setLabel('Custom')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({
    content:
      `💰 **Send tip to ${recipient.username}**\n\n` +
      `Your balance: ${formatETH(balance)} ETH\n\n` +
      `Select amount or use \`/tip @${recipient.username} <amount>\`:`,
    components: [row],
    ephemeral: false
  });
}

async function handleWithdraw(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const address = interaction.options.getString('address');
  const amount = interaction.options.getNumber('amount');

  if (!ethers.isAddress(address)) {
    return interaction.editReply({ content: '❌ Invalid Ethereum address.' });
  }

  if (amount <= 0) {
    return interaction.editReply({ content: '❌ Amount must be greater than 0.' });
  }

  const userId = getUserId(interaction.user);
  const amountWei = parseETH(amount.toString());

  // Check balance
  const balance = await contract.getBalance(userId);
  if (balance < amountWei) {
    return interaction.editReply({ content: `❌ Insufficient balance. You have ${formatETH(balance)} ETH.` });
  }

  await interaction.editReply({ content: '⏳ Processing withdrawal...' });

  // Withdraw
  const tx = await contract.withdraw(userId, address, amountWei);
  await tx.wait();

  await interaction.editReply({
    content:
      `✅ **Withdrawal successful!**\n\n` +
      `Amount: ${amount} ETH\n` +
      `To: \`${address}\`\n\n` +
      `Transaction: https://basescan.org/tx/${tx.hash}`
  });
}

async function handleStats(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const userId = getUserId(interaction.user);
  const stats = await contract.getStats(userId);

  await interaction.editReply({
    content:
      `📊 **Your Statistics**\n\n` +
      `Balance: ${formatETH(stats[0])} ETH\n` +
      `Total Tips Sent: ${formatETH(stats[1])} ETH\n` +
      `Total Tips Received: ${formatETH(stats[2])} ETH\n\n` +
      `Keep tipping! 💰`
  });
}

async function handleButtonClick(interaction) {
  const [action, pendingId, amountStr] = interaction.customId.split('_');

  if (action !== 'tip') return;

  if (!pendingTips.has(pendingId)) {
    return interaction.reply({ content: '❌ Tip expired. Please use `/tip` again.', ephemeral: true });
  }

  const tipInfo = pendingTips.get(pendingId);

  // Only the tipper can click
  if (getUserId(interaction.user) !== tipInfo.fromUserId) {
    return interaction.reply({ content: '❌ Only the person who initiated the tip can complete it.', ephemeral: true });
  }

  if (amountStr === 'custom') {
    return interaction.reply({
      content:
        `To send a custom amount, use:\n` +
        `\`/tip @${tipInfo.toUsername}\` and select a preset amount, or contact support for custom amounts.`,
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: false });

  const amount = amountStr;
  const amountWei = parseETH(amount);

  // Check balance
  const balance = await contract.getBalance(tipInfo.fromUserId);
  if (balance < amountWei) {
    return interaction.editReply({ content: `❌ Insufficient balance. You have ${formatETH(balance)} ETH.` });
  }

  await interaction.editReply({ content: '⏳ Processing tip...' });

  // Send tip
  const tx = await contract.tip(tipInfo.fromUserId, tipInfo.toUserId, amountWei);
  await tx.wait();

  const fee = (parseFloat(amount) * 0.01).toFixed(6);
  const afterFee = (parseFloat(amount) * 0.99).toFixed(6);

  // Clean up
  pendingTips.delete(pendingId);

  // Notify sender
  await interaction.editReply({
    content:
      `✅ **Tip sent!**\n\n` +
      `From: ${tipInfo.fromUsername}\n` +
      `To: ${tipInfo.toUsername}\n` +
      `Amount: ${amount} ETH\n` +
      `Fee: ${fee} ETH (1%)\n` +
      `Received: ${afterFee} ETH\n\n` +
      `Transaction: https://basescan.org/tx/${tx.hash}`
  });

  // Notify recipient via DM
  try {
    // Get numeric ID from username mapping
    const recipientUsername = tipInfo.toUsername?.toLowerCase();
    const recipientNumericId = usernameToId.get(recipientUsername);

    if (recipientNumericId) {
      const recipientUser = await client.users.fetch(recipientNumericId);

      await recipientUser.send(
        `🎉 **You received a tip!**\n\n` +
        `From: ${tipInfo.fromUsername}\n` +
        `Amount: ${afterFee} ETH\n` +
        `Your User ID: \`${tipInfo.toUserId}\`\n\n` +
        `💰 Your new balance includes this tip!\n\n` +
        `To check balance: \`/balance\`\n` +
        `To withdraw: \`/withdraw <address> <amount>\`\n\n` +
        `Transaction: https://basescan.org/tx/${tx.hash}`
      );
    } else {
      console.log(`Could not notify @${tipInfo.toUsername} - not in username mapping yet`);
    }
  } catch (notifyError) {
    console.error('Failed to notify recipient:', notifyError);
    // Don't fail the whole transaction if notification fails
  }
}

// Start bot
registerCommands().then(() => {
  client.login(DISCORD_TOKEN);
});

// Graceful shutdown
process.on('SIGINT', () => {
  client.destroy();
  process.exit(0);
});
