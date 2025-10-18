import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("🚀 Starting BettingForwards contract deployment...");
  
  // Get the contract factory from artifacts
  const contractArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/BettingForwards.sol/BettingForwards.json", "utf8"));
  
  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC || "https://sepolia.base.org");
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📦 Deploying contract...");
  console.log("👤 Deployer address:", wallet.address);
  
  // Deploy the contract
  const factory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Network:", await provider.getNetwork());
  
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
    network: (await provider.getNetwork()).name,
    chainId: (await provider.getNetwork()).chainId.toString(),
    owner: owner,
    deploymentTime: new Date().toISOString(),
    abi: contractArtifact.abi
  };
  
  // Ensure lib/abi directory exists
  const abiDir = path.join(process.cwd(), 'lib', 'abi');
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }
  
  // Save contract info
  const contractPath = path.join(abiDir, 'BettingForwards.json');
  fs.writeFileSync(contractPath, JSON.stringify(contractInfo, null, 2, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));
  
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
