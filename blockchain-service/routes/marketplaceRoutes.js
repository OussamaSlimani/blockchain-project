const express = require("express");
const multer = require("multer");
const marketplaceController = require("../controllers/marketplaceController");
const router = express.Router();

// Setup multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to create a new NFT
router.post(
  "/create-token",
  upload.single("file"),
  marketplaceController.createToken
);

// Route to list an NFT for sale
router.post("/list-item", marketplaceController.listItemForSale);

// Route to buy an NFT
router.post("/buy-item", marketplaceController.buyItem);

// Route to fetch all unsold items
router.get("/unsold-items", marketplaceController.fetchUnsoldItems);

// Route to fetch user's NFTs
router.get("/my-nfts/:userAddress", marketplaceController.fetchMyNFTs);

// Route to fetch the token URI of a specific NFT
router.get("/token-uri/:tokenId", marketplaceController.fetchTokenURI);

module.exports = router;
