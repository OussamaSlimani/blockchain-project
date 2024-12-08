const { ethers } = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

const alchemyUrl = process.env.ALCHEMY_URL;
const abi = require("./abi.json");
const contractAddress = process.env.CONTRACT_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

const BlockchainService = {
  async createToken(tokenURI) {
    try {
      const listingFee = ethers.utils.parseEther("0.001");

      const tx = await contract.createToken(tokenURI, { value: listingFee });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  },

  async listItemForSale(tokenId, price) {
    try {
      const weiPrice = ethers.utils.parseEther(price.toString());

      const tx = await contract.listItemForSale(tokenId, weiPrice);

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error listing item for sale:", error);
      throw error;
    }
  },

  async buyItem(tokenId, price) {
    try {
      const weiPrice = ethers.utils.parseEther(price.toString());

      const tx = await contract.buyItem(tokenId, { value: weiPrice });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error buying item:", error);
      throw error;
    }
  },

  async fetchUnsoldItems() {
    try {
      const items = await contract.fetchUnsoldItems();
      return items.map((item) => ({
        tokenId: item.tokenId.toString(),
        seller: item.seller,
        owner: item.owner,
        price: ethers.utils.formatEther(item.price),
        sold: item.sold,
      }));
    } catch (error) {
      console.error("Error fetching unsold items:", error);
      throw error;
    }
  },

  async getTokenURI(tokenId) {
    try {
      const tokenURI = await contract.tokenURI(tokenId);
      return tokenURI;
    } catch (error) {
      console.error("Error fetching token URI:", error);
      throw error;
    }
  },

  async fetchMyNFTs(userAddress) {
    try {
      const items = await contract.fetchMyNFTs();

      return items
        .filter(
          (item) => item.owner.toLowerCase() === userAddress.toLowerCase()
        )
        .map((item) => ({
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          owner: item.owner,
          price: ethers.utils.formatEther(item.price),
          sold: item.sold,
        }));
    } catch (error) {
      console.error("Error fetching my NFTs:", error);
      throw error;
    }
  },
};

module.exports = BlockchainService;
