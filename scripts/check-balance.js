const hre = require("hardhat");

async function main() {
  // Old contract address
  const oldContractAddress = "0x62264D8aEA99df1D27d3345C743980a90b869850";
  const TipBot = await hre.ethers.getContractFactory("TipBot");
  const oldContract = TipBot.attach(oldContractAddress);

  // Decode the topic from transaction to get user ID
  // Topic: 0x0350a07fabbed62e8f398891cef12ed7d6f433d0f74e244242d41f76fb196abd
  // This is keccak256 hash of the userId string
  const userId = "tg_7966952338";

  try {
    const balance = await oldContract.getBalance(userId);
    console.log("User ID:", userId);
    console.log("Balance in OLD contract:", hre.ethers.formatEther(balance), "ETH");
  } catch (error) {
    console.log("Error reading balance:", error.message);
  }

  // Check contract total balance
  const provider = hre.ethers.provider;
  const contractBalance = await provider.getBalance(oldContractAddress);
  console.log("Total ETH in OLD contract:", hre.ethers.formatEther(contractBalance), "ETH");

  console.log("\n---");
  console.log("NEW Contract Address:", "0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a");
  console.log("You need to deposit to the NEW contract!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
