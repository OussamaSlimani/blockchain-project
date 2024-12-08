let userAccount = null;
let web3 = null;

// Connect to MetaMask
window.addEventListener("load", () => {
  if (window.ethereum) {
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        userAccount = accounts[0];
        console.log("Connected to MetaMask:", userAccount);
        web3 = new Web3(window.ethereum);
      })
      .catch((error) => {
        console.error("Error connecting to MetaMask", error);
        alert("Please install MetaMask to continue.");
      });
  } else {
    alert("MetaMask is not installed. Please install it to use this feature.");
  }
});

// Handle NFT Form Submission
document.getElementById("nftForm").addEventListener("submit", async (event) => {
  event.preventDefault();

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
