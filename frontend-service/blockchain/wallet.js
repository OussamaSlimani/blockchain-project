document.addEventListener("DOMContentLoaded", () => {
  const walletButton = document.getElementById("walletButton");
  const walletAddress = document.getElementById("walletAddress");

  // Function to check wallet connection status
  const isWalletConnected = () => {
    return localStorage.getItem("walletConnected") === "true";
  };

  // Function to connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        console.log("Connected account:", account);

        // Save connection status and account to localStorage
        localStorage.setItem("walletConnected", "true");
        localStorage.setItem("walletAddress", account);

        updateUI(account);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask or a compatible wallet extension!");
    }
  };

  // Function to disconnect wallet
  const disconnectWallet = () => {
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
    updateUI(null);
  };

  // Function to update button text, address display, and click event
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

  // Helper function to shorten the displayed wallet address
  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Initialize UI on page load
  const savedAddress = localStorage.getItem("walletAddress");
  updateUI(savedAddress);

  // Handle page refresh or navigation
  if (isWalletConnected()) {
    console.log("Wallet is still connected");
  }
});
