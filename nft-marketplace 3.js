// File: frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import NFTMarketplace from './contracts/NFTMarketplace.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ... (previous web3Modal configuration and other states remain the same)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* New branded header */}
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-6">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white tracking-wide">
                  Plousios Imperium Fashion
                </h1>
                <p className="text-purple-200 text-sm mt-1">
                  Exclusive NFT Fashion Marketplace
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="rounded-lg border p-2 bg-white/10 text-white border-purple-400"
              >
                {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                  <option key={key} value={key} className="text-gray-900">
                    {chain.name}
                  </option>
                ))}
              </select>
              
              {account ? (
                <div className="flex items-center space-x-3">
                  <span className="bg-purple-700 text-white px-4 py-2 rounded-lg border border-purple-400">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <button
                    onClick={() => {/* Add sign out logic */}}
                    className="text-purple-200 hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg border border-purple-400 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
          
          {/* Navigation sub-menu */}
          <nav className="flex space-x-6 py-4 border-t border-purple-800">
            <a href="/" className="text-white hover:text-purple-200 transition">Marketplace</a>
            <a href="/create" className="text-white hover:text-purple-200 transition">Create NFT</a>
            <a href="/profile" className="text-white hover:text-purple-200 transition">Profile</a>
            <a href="/collections" className="text-white hover:text-purple-200 transition">Collections</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading marketplace...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nfts.map((nft, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <img src={nft.image} alt={nft.name} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800">{nft.name}</h2>
                  <p className="text-gray-500 mt-1">{nft.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-bold text-purple-900">
                      {nft.price} {SUPPORTED_CHAINS[selectedChain].nativeCurrency}
                    </p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                      View Details
                    </button>
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
