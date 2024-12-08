const hre = require("hardhat");

async function main() {
  // Get the contract to deploy
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");

  console.log("Deploying NFTMarketplace contract...");

  // Deploy the contract
  const marketplace = await NFTMarketplace.deploy();

  console.log("NFTMarketplace contract deployed to:", marketplace.address);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
