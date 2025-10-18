const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("Deploying BettingForwards contract...");

  const BettingForwards = await hre.ethers.getContractFactory("BettingForwards");
  const bettingForwards = await BettingForwards.deploy();

  await bettingForwards.waitForDeployment();

  const address = await bettingForwards.getAddress();
  console.log("BettingForwards deployed to:", address);

  // Save the contract address and ABI for frontend use
  const contractInfo = {
    address: address,
    abi: JSON.parse(BettingForwards.interface.format('json'))
  };

  fs.writeFileSync(
    './lib/abi/BettingForwards.json',
    JSON.stringify(contractInfo, null, 2)
  );
  console.log("Contract address and ABI saved to ./lib/abi/BettingForwards.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});