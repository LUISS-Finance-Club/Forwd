require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying BettingForwardsV2 with pure ethers v5...");

  // Connect to Base Sepolia
  const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📝 Deploying with:", wallet.address);

  // Read compiled contract
  const artifact = JSON.parse(
    fs.readFileSync('./artifacts/contracts/BettingForwardsV2.sol/BettingForwardsV2.json', 'utf8')
  );

  // Create contract factory
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  // Deploy
  console.log("⏳ Deploying contract...");
  const contract = await factory.deploy();
  
  console.log("⏳ Waiting for deployment...");
  await contract.deployed();

  console.log("✅ BettingForwardsV2 deployed to:", contract.address);
  console.log("🔗 BaseScan:", `https://sepolia.basescan.org/address/${contract.address}`);
  
  console.log("\n📋 SAVE THIS ADDRESS:");
  console.log(contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
