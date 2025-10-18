async function main() {
  console.log("Deploying BettingForwards contract to Base Sepolia...");

  const BettingForwards = await ethers.getContractFactory("BettingForwards");
  const contract = await BettingForwards.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ CONTRACT DEPLOYED TO:", address);
  console.log("View on BaseScan Sepolia: https://sepolia.basescan.org/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
