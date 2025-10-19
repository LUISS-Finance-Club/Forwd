const hre = require("hardhat");

async function main() {
  console.log("Deploying BettingForwardsV3 with Options...");

  const BettingForwardsV3 = await hre.ethers.getContractFactory("BettingForwardsV3");
  const contract = await BettingForwardsV3.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("BettingForwardsV3 deployed to:", address);
  console.log("\nFeatures:");
  console.log("✅ Forwards (lock odds)");
  console.log("✅ Backwards (buy/sell positions)");
  console.log("✅ Options (right not obligation)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
