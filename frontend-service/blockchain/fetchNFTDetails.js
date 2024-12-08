document.addEventListener("DOMContentLoaded", () => {
  const walletButton = document.getElementById("walletButton");
  const walletAddress = document.getElementById("walletAddress");

  let web3 = null; // Declare web3 instance

  const isWalletConnected = () => {
    return localStorage.getItem("walletConnected") === "true";
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        console.log("Connected account:", account);

        localStorage.setItem("walletConnected", "true");
        localStorage.setItem("walletAddress", account);

        web3 = new Web3(window.ethereum); // Initialize web3 instance

        updateUI(account);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask or a compatible wallet extension!");
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
    web3 = null; // Clear web3 instance
    updateUI(null);
  };

  const updateUI = (account) => {
    if (isWalletConnected() && account) {
      walletButton.textContent = "Disconnect from wallet";
      walletButton.onclick = disconnectWallet;
      walletAddress.textContent = `${shortenAddress(account)}`;
    } else {
      walletButton.textContent = "Connect to wallet";
      walletButton.onclick = connectWallet;
      walletAddress.textContent = "";
    }
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const savedAddress = localStorage.getItem("walletAddress");
  updateUI(savedAddress);

  if (isWalletConnected()) {
    console.log("Wallet is still connected");
    web3 = new Web3(window.ethereum); // Reinitialize web3 if the wallet is already connected
  }

  window.getWeb3Instance = () => web3; // Make web3 accessible globally for NFT functions
});

// Fetch NFT details function remains the same
async function fetchNFTDetails(tokenId) {
  try {
    const unsoldResponse = await axios.get(
      `https://blockchain-tul0.onrender.com/api/marketplace/unsold-items`
    );
    if (!unsoldResponse.data.success) {
      alert("Error fetching unsold items.");
      return;
    }

    const nftItem = unsoldResponse.data.unsoldItems.find(
      (item) => item.tokenId === tokenId
    );
    if (!nftItem) {
      alert("NFT not found in unsold items.");
      return;
    }

    const tokenURIResponse = await axios.get(
      `https://blockchain-tul0.onrender.com/api/marketplace/token-uri/${tokenId}`
    );

    if (tokenURIResponse.data.success) {
      const tokenURI = tokenURIResponse.data.tokenURI;
      const ipfsUrl = `https://ipfs.io/ipfs/${tokenURI}`;
      const metadata = await axios.get(ipfsUrl);

      document.getElementById(
        "nftImage"
      ).src = `https://ipfs.io/ipfs/${metadata.data.image}`;
      document.getElementById("nftTitle").textContent = metadata.data.name;
      document.getElementById("nftCreator").textContent = metadata.data.creator;

      document.getElementById("nftPrice").textContent = `${nftItem.price} ETH`;
      document.getElementById("nftDescription").textContent =
        metadata.data.description;

      const buyButton = document.getElementById("buyButton");
      buyButton.textContent = "Buy Now";
      buyButton.disabled = false;

      buyButton.onclick = () => buyNFT(tokenId, nftItem.price);
    } else {
      alert("Error fetching NFT details.");
    }
  } catch (error) {
    console.error(error);
    alert("Error fetching NFT details.");
  }
}

// Updated Buy NFT function
async function buyNFT(tokenId, price) {
  const web3 = window.getWeb3Instance();
  if (!web3) {
    alert("Web3 is not initialized. Please connect your wallet first.");
    return;
  }

  if (!localStorage.getItem("walletConnected")) {
    alert("Please connect your wallet first.");
    return;
  }

  const account = localStorage.getItem("walletAddress");
  if (!account) {
    alert("Wallet address not found. Please reconnect your wallet.");
    return;
  }

  const weiPrice = web3.utils.toWei(price, "ether");

  const buyButton = document.getElementById("buyButton");
  buyButton.textContent = "Loading...";
  buyButton.disabled = true; // Disable the button to prevent multiple clicks

  try {
    const response = await axios.post(
      "https://blockchain-tul0.onrender.com/api/marketplace/buy-item",
      {
        tokenId: tokenId,
        price: price,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      window.location.href = "buy.html";
    } else {
      window.location.href = "404.html";
    }
  } catch (error) {
    console.error(error);
    alert("Error purchasing NFT. Check the console for details.");
  } finally {
    buyButton.textContent = "Buy Now";
    buyButton.disabled = false; // Re-enable the button
  }
}

const tokenId = new URLSearchParams(window.location.search).get("tokenId");
fetchNFTDetails(tokenId);
