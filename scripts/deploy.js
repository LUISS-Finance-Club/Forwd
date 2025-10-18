import hre from "hardhat";
import fs from 'fs';

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

  console.log("Contract info saved to ./lib/abi/BettingForwards.json");
  
  // Verify contract on BaseScan (optional)
  if (hre.network.name === "baseSepolia" || hre.network.name === "base") {
    console.log("Waiting for contract to be mined...");
    await bettingForwards.deploymentTransaction()?.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified on BaseScan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
