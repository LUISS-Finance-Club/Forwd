const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting BettingForwards contract deployment...");
  
  // Get the contract factory
  const BettingForwards = await ethers.getContractFactory("BettingForwards");
  
  console.log("📦 Deploying contract...");
  
  // Deploy the contract
  const contract = await BettingForwards.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Network:", await ethers.provider.getNetwork());
  
  // Verify contract deployment
  console.log("🔍 Verifying deployment...");
  const owner = await contract.owner();
  const nextForwardId = await contract.nextForwardId();
  const platformFee = await contract.platformFee();
  
  console.log("👤 Owner:", owner);
  console.log("🆔 Next Forward ID:", nextForwardId.toString());
  console.log("💰 Platform Fee:", platformFee.toString(), "basis points");
  
  // Save contract info to file
  const contractInfo = {
    address: contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    owner: owner,
    deploymentTime: new Date().toISOString(),
    abi: BettingForwards.interface.format("json")
  };
  
  // Ensure lib/abi directory exists
  const abiDir = path.join(process.cwd(), 'lib', 'abi');
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }
  
  // Save contract info
  const contractPath = path.join(abiDir, 'BettingForwards.json');
  fs.writeFileSync(contractPath, JSON.stringify(contractInfo, null, 2));
  
  console.log("💾 Contract info saved to:", contractPath);
  
  // Display verification instructions
  console.log("\n🔍 To verify the contract on BaseScan:");
  console.log(`npx hardhat verify --network baseSepolia ${contractAddress}`);
  
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });