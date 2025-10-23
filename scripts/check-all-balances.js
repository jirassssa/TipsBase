const hre = require("hardhat");

async function main() {
  const contractAddress = "0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a";
  const TipBot = await hre.ethers.getContractFactory("TipBot");
  const contract = TipBot.attach(contractAddress);

  // Check both possible user IDs
  const userIds = [
    "tg_7966952338",
    "@kimzimi"
  ];

  console.log("Checking balances in NEW contract:", contractAddress);
  console.log("");

  for (const userId of userIds) {
    try {
      const balance = await contract.getBalance(userId);
      console.log(`User ID: ${userId}`);
      console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
      console.log("");
    } catch (error) {
      console.log(`User ID: ${userId}`);
      console.log(`Error: ${error.message}`);
      console.log("");
    }
  }

  // Check contract total
  const provider = hre.ethers.provider;
  const contractBalance = await provider.getBalance(contractAddress);
  console.log("Total ETH in contract:", hre.ethers.formatEther(contractBalance), "ETH");
}

main().catch(console.error);
