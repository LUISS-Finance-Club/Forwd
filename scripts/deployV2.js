const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BettingForwardsV2...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Deploy the contract
  const BettingForwardsV2 = await hre.ethers.getContractFactory("BettingForwardsV2");
  const contract = await BettingForwardsV2.deploy();

  // Wait for deployment to finish
  await contract.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await contract.getAddress();

  console.log("✅ BettingForwardsV2 deployed to:", contractAddress);
  console.log("🔗 View on BaseScan:", `https://sepolia.basescan.org/address/${contractAddress}`);
  console.log("\n📋 COPY THIS ADDRESS TO app/utils/contractV2.js:");
  console.log(`export const CONTRACT_ADDRESS_V2 = "${contractAddress}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
