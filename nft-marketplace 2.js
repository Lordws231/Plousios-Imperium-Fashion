// Add these imports to the existing imports
import QRCode from 'qrcode.react';
import { utils } from 'ethers';
import Barcode from 'react-barcode';

// Add this component for NFT creation
function CreateNFT({ provider, selectedChain }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [barcode, setBarcode] = useState('');

  const generateBarcode = async () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // Generate unique barcode
    const barcodeData = utils.solidityKeccak256(
      ['address', 'uint256', 'uint256'],
      [address, timestamp, random]
    );
    
    // Create signature
    const signature = await signer.signMessage(barcodeData);
    
    return {
      barcode: barcodeData,
      signature: signature
    };
  };

  const createNFT = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload file to IPFS
      const imageUrl = await uploadToIPFS(file);
      
      // 2. Generate barcode and signature
      const { barcode, signature } = await generateBarcode();
      setBarcode(barcode);

      // 3. Create metadata
      const metadata = {
        name,
        description,
        image: imageUrl,
        barcode,
        createdAt: new Date().toISOString()
      };
      
      // 4. Upload metadata to IPFS
      const metadataUrl = await uploadToIPFS(metadata);

      // 5. Create NFT
      const contract = new ethers.Contract(
        NFTMarketplace.address[selectedChain],
        NFTMarketplace.abi,
        provider.getSigner()
      );

      const priceInWei = ethers.utils.parseEther(price);
      const transaction = await contract.createToken(
        metadataUrl,
        priceInWei,
        barcode,
        signature
      );

      await transaction.wait();
      
      // Success handling
    } catch (error) {
      console.error('Error creating NFT:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create New NFT</h2>
      <form onSubmit={createNFT}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border rounded p-2"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Price ({SUPPORTED_CHAINS[selectedChain].nativeCurrency})
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {barcode && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Asset Barcode
            </label>
            <div className="flex justify-center space-x-4">
              <Barcode value={barcode} />
              <QRCode value={barcode} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create NFT'}
        </button>
      </form>
    </div>
  );
}

// Add this component for barcode verification
function VerifyBarcode({ contract }) {
  const [barcode, setBarcode] = useState('');
  const [verification, setVerification] = useState(null);

  const verifyBarcode = async () => {
    try {
      const result = await contract.verifyBarcode(barcode);
      setVerification({
        exists: result[0],
        tokenId: result[1].toString(),
        creator: result[2],
        creationTime: new Date(result[3].toNumber() * 1000).toLocaleString(),
        assetFingerprint: result[4]
      });
    } catch (error) {
      console.error('Error verifying barcode:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Verify NFT</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          onClick={verifyBarcode}
          className="mt-2 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Verify
        </button>
      </div>

      {verification && (
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Verification Result</h3>
          <p>Status: {verification.exists ? 'Valid' : 'Invalid'}</p>
          {verification.exists && (
            <>
              <p>Token ID: {verification.tokenId}</p>
              <p>Creator: {verification.creator}</p>
              <p>Created: {verification.creationTime}</p>
              <p>Fingerprint: {verification.assetFingerprint}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
