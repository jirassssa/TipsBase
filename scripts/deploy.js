const hre = require("hardhat");

async function main() {
  console.log("Deploying TipBot contract to Base Mainnet...");

  const TipBot = await hre.ethers.getContractFactory("TipBot");
  const tipBot = await TipBot.deploy();

  await tipBot.waitForDeployment();

  const address = await tipBot.getAddress();
  console.log("✅ TipBot deployed to:", address);
  console.log("Save this address to .env as CONTRACT_ADDRESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
