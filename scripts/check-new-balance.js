const hre = require("hardhat");

async function main() {
  const newContractAddress = "0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a";
  const TipBot = await hre.ethers.getContractFactory("TipBot");
  const newContract = TipBot.attach(newContractAddress);

  const userId = "tg_7966952338";

  console.log("Checking NEW contract:", newContractAddress);
  console.log("User ID:", userId);
  console.log("");

  try {
    const balance = await newContract.getBalance(userId);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  } catch (error) {
    console.log("Error reading balance:", error.message);
  }

  // Check contract total balance
  const provider = hre.ethers.provider;
  const contractBalance = await provider.getBalance(newContractAddress);
  console.log("Total ETH in contract:", hre.ethers.formatEther(contractBalance), "ETH");
  
  // Check recent deposits (last 10 blocks)
  const currentBlock = await provider.getBlockNumber();
  console.log("\nCurrent block:", currentBlock);
  console.log("Checking last 1000 blocks for deposits...");
  
  const filter = newContract.filters.Deposit();
  const events = await newContract.queryFilter(filter, currentBlock - 1000, currentBlock);
  
  console.log(`\nFound ${events.length} deposit(s):`);
  for (const event of events) {
    console.log(`  User: ${event.args.userId}`);
    console.log(`  Amount: ${hre.ethers.formatEther(event.args.amount)} ETH`);
    console.log(`  Block: ${event.blockNumber}`);
    console.log(`  Tx: ${event.transactionHash}`);
    console.log('');
  }
}

main().catch(console.error);
