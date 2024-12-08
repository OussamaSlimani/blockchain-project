const BlockchainService = require("../services/blockchainService");
const IPFSService = require("../services/ipfsService");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const marketplaceController = {
  async createToken(req, res) {
    try {
      const { file } = req; // Multer processes and attaches the file
      let metadata = req.body.metadata;

      if (!file) {
        return res
          .status(400)
          .json({ success: false, error: "File is required" });
      }

      if (typeof metadata === "string") {
        metadata = JSON.parse(metadata); // Parse metadata if sent as JSON string
      }

      // Upload file to IPFS
      const ipfsFile = await IPFSService.uploadFile(
        file.buffer,
        file.originalname
      );

      // Add IPFS hash of the file to metadata
      const metadataToUpload = { ...metadata, image: ipfsFile.IpfsHash };

      // Upload metadata to IPFS
      const ipfsMetadata = await IPFSService.uploadJSON(metadataToUpload);

      // Interact with blockchain to create the token
      const transactionHash = await BlockchainService.createToken(
        ipfsMetadata.IpfsHash
      );

      res.json({
        success: true,
        transactionHash,
        tokenURI: ipfsMetadata.IpfsHash,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // List an NFT for sale
  async listItemForSale(req, res) {
    try {
      const { tokenId, price } = req.body;
      const transactionHash = await BlockchainService.listItemForSale(
        tokenId,
        price
      );
      res.json({ success: true, transactionHash });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Buy an NFT
  async buyItem(req, res) {
    try {
      const { tokenId, price } = req.body;
      const transactionHash = await BlockchainService.buyItem(tokenId, price);
      res.json({ success: true, transactionHash });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Fetch all unsold items from the marketplace
  async fetchUnsoldItems(req, res) {
    try {
      const unsoldItems = await BlockchainService.fetchUnsoldItems();
      res.json({ success: true, unsoldItems });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // fetch the token URI
  async fetchTokenURI(req, res) {
    try {
      const { tokenId } = req.params;
      const tokenURI = await BlockchainService.getTokenURI(tokenId);
      res.json({ success: true, tokenURI });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Fetch NFTs owned by a specific user
  async fetchMyNFTs(req, res) {
    try {
      const { userAddress } = req.params;
      const myNFTs = await BlockchainService.fetchMyNFTs(userAddress);
      res.json({ success: true, myNFTs });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = marketplaceController;
