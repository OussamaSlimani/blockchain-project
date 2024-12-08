async function fetchNFTDetails(tokenId) {
  try {
    const tokenURIResponse = await axios.get(
      `https://blockchain-tul0.onrender.com/api/marketplace/token-uri/${tokenId}`
    );

    if (tokenURIResponse.data.success) {
      const tokenURI = tokenURIResponse.data.tokenURI;
      const ipfsUrl = `https://ipfs.io/ipfs/${tokenURI}`;
      const metadata = await axios.get(ipfsUrl);

      // Update the DOM elements with NFT details
      document.getElementById(
        "nftImage"
      ).src = `https://ipfs.io/ipfs/${metadata.data.image}`;
      document.getElementById("nftTitle").textContent = metadata.data.name;
      document.getElementById("nftCreator").textContent = metadata.data.creator;
      document.getElementById(
        "nftPrice"
      ).textContent = `${metadata.data.price} ETH`;
      document.getElementById("nftDescription").textContent =
        metadata.data.description;

      // Enable the Buy button
      const buyButton = document.getElementById("buyButton");
      buyButton.textContent = "Buy Now";
      buyButton.disabled = false;
      buyButton.onclick = () => buyNFT(tokenId, metadata.data.price);
    } else {
      alert("Error fetching NFT details.");
    }
  } catch (error) {
    console.error(error);
    alert("Error fetching NFT details.");
  }
}

async function buyNFT(tokenId, price) {
  alert(`You are buying this NFT at ${price} ETH`);
  // Add purchase logic here
}

// Get tokenId from URL query parameters and fetch details
const tokenId = new URLSearchParams(window.location.search).get("tokenId");
fetchNFTDetails(tokenId);
