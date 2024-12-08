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

  const formData = new FormData();
  const nftName = document.getElementById("nftName").value;
  const nftDescription = document.getElementById("nftDescription").value;
  const nftCreator = document.getElementById("nftCreator").value;
  const nftFile = document.getElementById("nftFile").files[0];

  // Add the file and metadata to the form data
  formData.append("file", nftFile);
  formData.append(
    "metadata",
    JSON.stringify({
      name: nftName,
      description: nftDescription,
      creator: nftCreator,
    })
  );

  // Display status
  document.getElementById("status").innerText = "Uploading...";

  try {
    const response = await axios.post(
      "https://blockchain-tul0.onrender.com/api/marketplace/create-token",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    document.getElementById(
      "status"
    ).innerText = `NFT Created! Transaction Hash: ${response.data.transactionHash}`;
  } catch (error) {
    console.error(error);
    document.getElementById("status").innerText =
      "Error creating NFT. Check console for details.";
  }
});
