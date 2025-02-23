// File: frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import NFTMarketplace from './contracts/NFTMarketplace.json';

// Supported blockchains configuration
const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    nativeCurrency: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: 'MATIC',
    blockExplorer: 'https://polygonscan.com'
  },
  // Add more chains as needed
};

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Web3Modal configuration
  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectConnector,
        options: {
          infuraId: "YOUR_INFURA_KEY"
        }
      }
    }
  });

  const connectWallet = async () => {
    try {
      const web3Provider = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(web3Provider);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(provider);
      setAccount(address);
      
      // Load NFTs after connecting
      loadNFTs(provider);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const loadNFTs = async (provider) => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(
        NFTMarketplace.address[selectedChain],
        NFTMarketplace.abi,
        provider
      );

      const data = await contract.fetchMarketItems();
      const items = await Promise.all(data.map(async i => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await fetch(tokenUri).then(res => res.json());
        return {
          price: ethers.utils.formatUnits(i.price.toString(), 'ether'),
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
      }));

      setNfts(items);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold">NFT Marketplace</h1>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="rounded-lg border p-2"
              >
                {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                  <option key={key} value={key}>{chain.name}</option>
                ))}
              </select>
              {account ? (
                <span className="bg-green-500 text-white px-4 py-2 rounded-lg">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nfts.map((nft, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img src={nft.image} alt={nft.name} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{nft.name}</h2>
                  <p className="text-gray-500">{nft.description}</p>
                  <div className="mt-4">
                    <p className="text-lg font-bold">{nft.price} {SUPPORTED_CHAINS[selectedChain].nativeCurrency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
