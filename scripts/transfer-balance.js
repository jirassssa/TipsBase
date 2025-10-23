const hre = require("hardhat");

async function main() {
  const contractAddress = "0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a";
  const TipBot = await hre.ethers.getContractFactory("TipBot");
  const contract = TipBot.attach(contractAddress);

  const fromUserId = "@kimzimi";
  const toUserId = "tg_7966952338";

  // Get balance
  const balance = await contract.getBalance(fromUserId);
  console.log("Balance in @kimzimi:", hre.ethers.formatEther(balance), "ETH");

  if (balance > 0) {
    console.log("\nTransferring to tg_7966952338...");

    // Use tip function with 0 fee since we're moving user's own money
    const tx = await contract.tip(fromUserId, toUserId, balance);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("✅ Transfer complete!");

    // Check new balance
    const newBalance = await contract.getBalance(toUserId);
    console.log("\nNew balance in tg_7966952338:", hre.ethers.formatEther(newBalance), "ETH");
  } else {
    console.log("No balance to transfer");
  }
}

main().catch(console.error);
