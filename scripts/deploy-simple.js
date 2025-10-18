const hre = require("hardhat");

async function main() {
  console.log("Deploying BettingForwards contract to Base Sepolia...");

  // Get contract bytecode and ABI
  const BettingForwards = await hre.ethers.getContractFactory("BettingForwards");
  
  // Deploy
  console.log("Deploying contract...");
  const contract = await BettingForwards.deploy();
  
  // Wait for deployment
  console.log("Waiting for deployment confirmation...");
  await contract.deployed();

  console.log("\n✅ CONTRACT DEPLOYED TO:", contract.address);
  console.log("View on BaseScan Sepolia: https://sepolia.basescan.org/address/" + contract.address);
  console.log("\n🎉 Copy this address and update your frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
