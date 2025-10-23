const hre = require("hardhat");

async function main() {
  const contractAddress = "0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a";
  const TipBot = await hre.ethers.getContractFactory("TipBot");
  const contract = TipBot.attach(contractAddress);

  const fromUserId = "tg_7966952338";
  const toUserId = "@kimzimi";

  // Get balance
  const balance = await contract.getBalance(fromUserId);
  console.log(`Balance in ${fromUserId}:`, hre.ethers.formatEther(balance), "ETH");

  if (balance > 0) {
    console.log(`\nTransferring to ${toUserId}...`);

    // Use tip function to transfer
    const tx = await contract.tip(fromUserId, toUserId, balance);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("✅ Transfer complete!");

    // Check new balance
    const newBalance = await contract.getBalance(toUserId);
    console.log(`\nNew balance in ${toUserId}:`, hre.ethers.formatEther(newBalance), "ETH");

    // Check old balance
    const oldBalance = await contract.getBalance(fromUserId);
    console.log(`Remaining in ${fromUserId}:`, hre.ethers.formatEther(oldBalance), "ETH");
  } else {
    console.log("No balance to transfer");
  }
}

main().catch(console.error);
