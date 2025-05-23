import "./App.css";
import Nav from "./Nav/Nav";
import TokenPart from "./Token/Token";
import SenderTable from "./Table";
import Transfer from "./Transfer/Transfer";
import ConnectWallet from "./ConnectWallet";
import Fee from "./Fee";
import Airdrop from "./Airdrop";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { RPC_URL, SECRET_KEY } from "./config";

import MyToken from "./MetaCoin.json"; // Your token ABI
const tokenAddress = "0xe90eCA1dd2e7D6FfE2550dB0f7A0bdbA31f018d0";


// Load the sender's wallet from the private key
const provider = new ethers.JsonRpcProvider(RPC_URL);
const senderWallet = new ethers.Wallet(SECRET_KEY, provider);

function App() {
  // State variables
  const [isConnected, setIsConnected] = useState(false); // Connection state
  const [tokenAddress, setTokenAddress] = useState("0xdAC17F958D2ee523a2206206994597C13D831ec7"); // ERC-20 token contract address
  const [wallets, setWallets] = useState([]); // List of recipient addresses
  const [walletAddress, setWalletAddress] = useState("");
  const [quantity, setQuantity] = useState(0); // Tokens to send per wallet
  const [fee, setFee] = useState(0); // Gas fee per transaction (not actively used for Ethereum)
  const [loading, setLoading] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(0); // Sender's token balance
  const [validAddresses, setValidAddresses] = useState([]);
  const [invalidAddresses, setInvalidAddresses] = useState([]);
  const [error, setError] = useState("");

  // Fetch token balance of the sender's wallet
  useEffect(() => {
    if (tokenAddress) {
      getTokenBalance();
    }
  }, [tokenAddress]);

  const getTokenBalance = async () => {
    try {
      const erc20ABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(senderWallet.address);
      setBalanceAmount(Number(ethers.formatUnits(balance, decimals)));
    } catch (error) {
      console.error("Error fetching token balance:", error);
      alert("Failed to fetch token balance. Check the token address and try again.");
    }
  };

  const handleConnect = async () => {
    if (isConnected) {
      const confirmDisconnect = window.confirm("Do you want to disconnect?");
      if (confirmDisconnect) {
        setIsConnected(false);
        setWalletAddress("");
        alert("You have been disconnected.");
      }
    } else {
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            setIsConnected(true);
            setWalletAddress(accounts[0]);
            alert(`Connected to wallet: ${accounts[0]}`);
          }
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
          alert("Failed to connect to MetaMask. Please try again.");
        }
      } else {
        alert("MetaMask is not installed. Please install MetaMask and try again.");
      }
    }
  };

  const handleAirdrop = async () => {
    if (!tokenAddress || wallets.length === 0 || quantity <= 0) {
      alert("Please fill in all parameters correctly!");
      return;
    }
  
    setLoading(true);
    try {
      // Connect to local Ganache network
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
  
      // Use the private key of the sender (from Ganache accounts)
      const senderPrivateKey = "0x4466a0dba0dcc46a8ece2f99ab2b9bc2f5acd2ffdc7e1d2a0fafc88b270b2b6a";
      const senderWallet = new ethers.Wallet(senderPrivateKey, provider);
  
      // Use Truffle-generated ABI
      const tokenContract = new ethers.Contract(tokenAddress, MyToken.abi, senderWallet);
  
      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits(quantity.toString(), decimals);
  
      for (let i = 0; i < wallets.length; i++) {
        const recipient = wallets[i];
        console.log(`Transferring ${quantity} tokens to ${recipient}...`);
        const tx = await tokenContract.transfer(recipient, amount);
        await tx.wait();
        console.log(`Successfully sent to ${recipient}`);
      }
  
      alert("Airdrop completed successfully!");
    } catch (error) {
      console.error("Airdrop failed:", error);
      alert("Airdrop failed! Check the console for more details.");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <Nav />
      <div style={{ opacity: loading ? 0.5 : 1 }}>
        {loading && (
          <div className="d-flex justify-content-center align-items-center custom-loading">
            <Spinner animation="border" variant="primary" role="status" />
          </div>
        )}
        <div className="connectWallet">
          {/* Future MetaMask Connection: Placeholder */}
          <div className="connectWallet">
          <ConnectWallet
            handleConnect={handleConnect}
            isConnected={isConnected}
          />
        </div>
          {/* <button className="btn btn-danger" disabled>
            <h3>MetaMask (Coming Soon)</h3>
          </button> */}
        </div>
        <div className="event">
          <SenderTable wallets={wallets} setWallets={setWallets} isConnected = {isConnected} walletAddress = {walletAddress}/>
        </div>
        <div className="main">
          <TokenPart
            tokenaddress={tokenAddress}
            setTokenAddress={setTokenAddress}
            balanceAmount={balanceAmount}
          />
          <Transfer
            quantity={quantity}
            setQuantity={setQuantity}
            totalQuantity={wallets?.length ? wallets.length * quantity : 0}
            balanceAmount={balanceAmount}
          />
          <Fee
            fee={fee}
            setFee={setFee}
            totalFee={wallets?.length ? wallets.length * fee : 0}
          />
        </div>
        <div className="airdrop">
          <Airdrop
            isConnected={
              isConnected && wallets?.length
                ? wallets.length * quantity < balanceAmount
                : 0
            }
            handleAirdrop={handleAirdrop}
          />
          {/* <Airdrop handleAirdrop={handleAirdrop} isConnected={true} /> */}
        </div>
      </div>
    </div>
  );
}

export default App;