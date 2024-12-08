// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 public listingFee = 0.001 ether; // Fee to list an NFT
    address payable public marketplaceOwner;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event ItemBought(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    constructor() ERC721("NFTMarketplace", "NFTM") {
        marketplaceOwner = payable(msg.sender);
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Caller is not the token owner"
        );
        _;
    }

    modifier validPrice(uint256 price) {
        require(price > 0, "Price must be greater than zero");
        _;
    }

    // Create a new NFT
    function createToken(
        string memory tokenURI
    ) public payable returns (uint256) {
        require(msg.value == listingFee, "Listing fee required");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        // Set ownership to creator until listed
        idToMarketItem[newTokenId] = MarketItem({
            tokenId: newTokenId,
            seller: payable(msg.sender),
            owner: payable(msg.sender),
            price: 0,
            sold: false
        });

        return newTokenId;
    }

    // List an NFT for sale
    function listItemForSale(
        uint256 tokenId,
        uint256 price
    ) public onlyTokenOwner(tokenId) validPrice(price) {
        MarketItem storage item = idToMarketItem[tokenId];
        require(!item.sold, "Item already sold");

        item.price = price;
        item.seller = payable(msg.sender);
        item.owner = payable(address(this));
        item.sold = false;

        _transfer(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    // Purchase an NFT
    function buyItem(uint256 tokenId) public payable {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.owner == address(this), "Item is not listed for sale");
        require(msg.value == item.price, "Incorrect payment amount");

        item.owner = payable(msg.sender);
        item.sold = true;
        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);
        item.seller.transfer(msg.value);

        emit ItemBought(tokenId, item.seller, msg.sender, item.price);
    }

    // Withdraw marketplace fees
    function withdrawFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        marketplaceOwner.transfer(balance);
    }

    // Fetch unsold items
    function fetchUnsoldItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldCount = itemCount - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == address(this)) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        return items;
    }

    // Fetch user's purchased NFTs
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 myItemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                myItemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](myItemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        return items;
    }
}
