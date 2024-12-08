let userAccount = null;
let web3 = null;

// Function to initialize the app and fetch NFTs
async function initApp() {
  // Check if the wallet is connected
  const isWalletConnected = localStorage.getItem("walletConnected") === "true";

  if (!isWalletConnected) {
    document.getElementById("messageDiv").innerHTML =
      "<p style='color: red;'>You have to connect first.</p>";
    return;
  }

  if (window.ethereum) {
    try {
      // Get user account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      userAccount = accounts[0];

      // Initialize Web3
      web3 = new Web3(window.ethereum);

      // Fetch NFTs after confirming wallet is connected
      fetchMyNFTs();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      document.getElementById("messageDiv").innerHTML =
        "<p style='color: red;'>Error connecting to wallet. Please try again.</p>";
    }
  } else {
    document.getElementById("messageDiv").innerHTML =
      "<p style='color: red;'>MetaMask is not installed. Please install it to use this feature.</p>";
  }
}

// Fetch NFTs owned by the user
async function fetchMyNFTs() {
  if (!userAccount) {
    document.getElementById("messageDiv").innerHTML =
      "<p style='color: red;'>You have to connect first.</p>";
    return;
  }

  try {
    const response = await axios.get(
      `https://blockchain-tul0.onrender.com/api/marketplace/my-nfts/${userAccount}`
    );

    if (response.data.success) {
      const myNFTs = response.data.myNFTs;
      const nftList = document.getElementById("nftList");

      nftList.innerHTML = ""; // Clear previous results

      if (myNFTs.length === 0) {
        nftList.innerHTML =
          "<p class='text-center'>You don't own any NFTs yet.</p>";
      } else {
        myNFTs.forEach(async (nft) => {
          const tokenURIResponse = await axios.get(
            `https://blockchain-tul0.onrender.com/api/marketplace/token-uri/${nft.tokenId}`
          );

          if (tokenURIResponse.data.success) {
            const tokenURI = tokenURIResponse.data.tokenURI;
            const ipfsUrl = `https://ipfs.io/ipfs/${tokenURI}`;

            // Fetch NFT metadata from IPFS
            const metadata = await axios.get(ipfsUrl);

            const nftCard = document.createElement("div");
            nftCard.className =
              "col-12 col-sm-6 col-lg-4 col-xl-3 list-item cards";

            nftCard.innerHTML = `
              <div class="nft-card card shadow-sm">
                <div class="card-body">
                  <div class="img-wrap">
                    <img src="https://ipfs.io/ipfs/${
                      metadata.data.image
                    }" alt="NFT Image" class="img-fluid" />
                  </div>
                  <!-- NFT Info -->
                  <div class="mt-3">
                    <p><strong>Name:</strong> ${metadata.data.name}</p>
                    <p><strong>Description:</strong> ${
                      metadata.data.description
                    }</p>
                    <p><strong>Creator:</strong> ${metadata.data.creator}</p>
                    <p><strong>Price:</strong> ${nft.price} ETH</p>
                    <p><strong>Sold:</strong> ${nft.sold ? "Yes" : "No"}</p>
                  </div>
                  <!-- List for Sale -->
                  <div class="mt-3">
                    <input type="number" id="price-${
                      nft.tokenId
                    }" class="form-control form-control-sm mb-2" placeholder="Set price in ETH" step="0.01" />
                    <button class="btn btn-primary btn-sm w-100" onclick="listForSale(${
                      nft.tokenId
                    })">List for Sale</button>
                  </div>
                </div>
              </div>
            `;

            nftList.appendChild(nftCard);
          } else {
            console.error("Error fetching token URI", tokenURIResponse);
          }
        });
      }
    } else {
      document.getElementById("messageDiv").innerHTML =
        "<p style='color: red;'>Error fetching NFTs.</p>";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("messageDiv").innerHTML =
      "<p style='color: red;'>Error fetching NFTs. Check the console for details.</p>";
  }
}

// List NFT for Sale
async function listForSale(tokenId) {
  const priceInput = document.getElementById(`price-${tokenId}`);
  const price = parseFloat(priceInput.value);

  const messageDiv = document.getElementById("messageDiv");
  if (!price || price <= 0) {
    messageDiv.innerHTML =
      "<p style='color: red;'>Please enter a valid price.</p>";
    return;
  }

  try {
    messageDiv.innerHTML = "<p>Listing NFT for sale...</p>";
    const response = await axios.post(
      "https://blockchain-tul0.onrender.com/api/marketplace/list-item",
      {
        tokenId: tokenId,
        price: price,
        seller: userAccount,
      }
    );

    if (response.data.success) {
      messageDiv.innerHTML =
        "<p style='color: green;'>NFT listed for sale successfully!</p>";
    } else {
      messageDiv.innerHTML =
        "<p style='color: red;'>Error listing NFT for sale.</p>";
    }
  } catch (error) {
    console.error(error);
    messageDiv.innerHTML =
      "<p style='color: red;'>Error listing NFT for sale. Check the console for details.</p>";
  }
}

// Initialize app on page load
window.onload = initApp;
