const hre = require("hardhat");

async function main() {
  const txHash = "0x431d004ec60f785f72e0b5430243448b7516879141f9f3c5e6ff8c5688957186";
  const contractAddress = "0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a";

  const provider = hre.ethers.provider;
  const receipt = await provider.getTransactionReceipt(txHash);

  const TipBot = await hre.ethers.getContractFactory("TipBot");
  const contract = TipBot.attach(contractAddress);

  // Decode logs
  const iface = contract.interface;

  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      console.log("Event:", parsed.name);
      console.log("User ID:", parsed.args.userId);
      console.log("Amount:", hre.ethers.formatEther(parsed.args.amount), "ETH");

      // Now check balance
      const balance = await contract.getBalance(parsed.args.userId);
      console.log("\nCurrent balance for", parsed.args.userId, ":", hre.ethers.formatEther(balance), "ETH");
    } catch (e) {
      // Not a TipBot event, skip
    }
  }
}

main().catch(console.error);
