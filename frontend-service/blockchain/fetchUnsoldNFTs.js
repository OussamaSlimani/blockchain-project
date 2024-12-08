// Fetch unsold NFTs and render them after all data is retrieved
async function fetchUnsoldNFTs() {
  try {
    const response = await axios.get(
      "https://blockchain-tul0.onrender.com/api/marketplace/unsold-items"
    );

    if (response.data.success) {
      const unsoldItems = response.data.unsoldItems;

      if (unsoldItems.length === 0) {
        document.getElementById("nft-list").innerHTML =
          "<p>No NFTs available for sale.</p>";
        return;
      }

      // Fetch metadata for all NFTs
      const nftPromises = unsoldItems.map(async (nft) => {
        try {
          const tokenURIResponse = await axios.get(
            `https://blockchain-tul0.onrender.com/api/marketplace/token-uri/${nft.tokenId}`
          );

          if (tokenURIResponse.data.success) {
            const tokenURI = tokenURIResponse.data.tokenURI;
            const ipfsUrl = `https://ipfs.io/ipfs/${tokenURI}`;
            const metadata = await axios.get(ipfsUrl);

            return {
              tokenId: nft.tokenId,
              seller: nft.seller,
              price: nft.price,
              metadata: metadata.data,
            };
          } else {
            console.error(
              `Error fetching token URI for Token ID ${nft.tokenId}`
            );
            return null;
          }
        } catch (err) {
          console.error(
            `Failed to fetch metadata for Token ID ${nft.tokenId}`,
            err
          );
          return null;
        }
      });

      // Wait for all promises to resolve
      const allNFTData = await Promise.all(nftPromises);

      // Filter out null results (in case of errors)
      const validNFTs = allNFTData.filter((nft) => nft !== null);

      // Render all NFTs at once
      renderNFTs(validNFTs);
    } else {
      alert("Error fetching unsold NFTs.");
    }
  } catch (error) {
    console.error("Error fetching unsold NFTs:", error);
    alert("Error fetching unsold NFTs. Check the console for details.");
  }
}

// Render all NFTs at once
function renderNFTs(nfts) {
  const nftListDiv = document.getElementById("nft-list");

  nftListDiv.innerHTML = ""; // Clear previous content

  nfts.forEach((nft) => {
    const nftCard = `
         <div class="col-12 col-sm-6 col-lg-4 col-xl-3 list-item cards">
           <div class="nft-card card shadow-sm">
             <div class="card-body">
               <div class="img-wrap">
                 <img src="https://ipfs.io/ipfs/${nft.metadata.image}" alt="NFT Image" />
               </div>
               <div class="row gx-2 align-items-center mt-3">
                 <div class="col-8">
                   <span class="d-block fz-18">${nft.price} ETH</span>
                 </div>
                 <div class="col-4 text-end">
                   <button class="wishlist-btn" type="button">
                     <i class="bi"></i>
                   </button>
                 </div>
               </div>
               <div class="row gx-2 align-items-center mt-2">
                 <div class="col-12">
                   <div class="name-info d-flex align-items-center">
                     <div class="name-author">
                       <p class="name d-block hover-primary fw-bold text-truncate">
                         ${nft.metadata.name}
                       </p>
                       <p class="author d-block fz-12 hover-primary text-truncate">
                         ${nft.metadata.creator}
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
               <div class="row gx-2 align-items-center mt-3">
                 <div class="col-6">
                   <a class="btn btn-primary btn-sm rounded-pill" onclick="viewNFTDetails(${nft.tokenId})">Details</a>
                 </div>
               </div>
             </div>
           </div>
         </div>
       `;

    nftListDiv.innerHTML += nftCard;
  });
}

// View NFT Details
function viewNFTDetails(tokenId) {
  window.location.href = `item-details.html?tokenId=${tokenId}`;
}

// Initial fetch of unsold NFTs
fetchUnsoldNFTs();
