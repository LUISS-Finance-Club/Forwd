const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BettingForwardsV2...");

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get contract factory
  const BettingForwardsV2 = await hre.ethers.getContractFactory("BettingForwardsV2");
  
  // Deploy
  const contract = await BettingForwardsV2.deploy();
  
  // Wait for deployment
  await contract.deployed();
  
  console.log("✅ BettingForwardsV2 deployed to:", contract.address);
  console.log("🔗 View on BaseScan:", `https://sepolia.basescan.org/address/${contract.address}`);
  
  // Wait for block confirmations before verifying
  console.log("⏳ Waiting 5 blocks for BaseScan to index...");
  await contract.deployTransaction.wait(5);
  
  // Verify on BaseScan
  console.log("🔍 Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: contract.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error.message);
    console.log("You can verify manually later!");
  }
  
  console.log("\n📋 SAVE THESE:");
  console.log("Contract Address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
