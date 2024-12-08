let userAccount = null;
let web3 = null;

// Check if wallet is connected before proceeding
const isWalletConnected = localStorage.getItem("walletConnected") === "true";
const walletAddress = localStorage.getItem("walletAddress");

// If wallet is connected, use the address; otherwise, prompt the user to connect
if (isWalletConnected) {
  userAccount = walletAddress;
  console.log("Wallet is connected: " + userAccount);
  web3 = new Web3(window.ethereum); // Initialize web3
} else {
  alert("Please connect your wallet to create an NFT.");
  // Optionally, you can show a more user-friendly message in the UI
}

// Handle NFT Form Submission
document.getElementById("nftForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Ensure wallet is connected before submitting the form
  if (!userAccount) {
    alert("Please connect to MetaMask first.");
    return;
  }

  const nftName = document.getElementById("nftName").value;
  const nftDescription = document.getElementById("nftDescription").value;
  const nftCreator = document.getElementById("nftCreator").value;
  const nftFile = document.getElementById("nftFile").files[0];

  if (!nftFile) {
    alert("Please select an image file to create an NFT.");
    return;
  }

  // Display status
  document.getElementById("status").innerText = "Creating NFT...";

  try {
    // Proceed directly with NFT creation
    const nftFormData = new FormData();
    nftFormData.append("file", nftFile);
    nftFormData.append(
      "metadata",
      JSON.stringify({
        name: nftName,
        description: nftDescription,
        creator: nftCreator,
      })
    );

    const nftResponse = await axios.post(
      "https://blockchain-tul0.onrender.com/api/marketplace/create-token",
      nftFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Redirect to create-nft.html on successful NFT creation
    document.getElementById("status").innerText = "NFT created successfully!";
    window.location.href = "create-nft.html";
  } catch (error) {
    console.error(error);
    document.getElementById("status").innerText =
      "Error during NFT creation. Check console for details.";
  }
});
