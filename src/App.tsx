// import functionalities
import React, { useEffect, useState } from 'react';
import './App.css';
import { PublicKey, Transaction } from "@solana/web3.js";

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

export default function App() {
  // create state variables for the provider and wallet address
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // this function runs when the component updates (e.g. render, refresh)
  useEffect(() => {
    const provider = getProvider();

    // if the phantom provider exists, set it as the provider
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  /**
   * @description prompts user to connect wallet if it exists.
   * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    const provider = getProvider();

    // checks if phantom wallet exists
    if (provider) {
      try {
        // connects wallet and returns response which includes the wallet public key
        const response = await provider.connect();
        console.log('wallet account ', response.publicKey.toString());
        // update walletAddress to be the public key
        setWalletAddress(response.publicKey.toString());
      } catch (err) {
        console.error('Error connecting wallet:', err);
      }
    }
  };

  /**
   * @description disconnects wallet
   */
  const disconnectWallet = async () => {
    if (provider) {
      try {
        await provider.disconnect();
        setWalletAddress(null); // Clear wallet address
      } catch (err) {
        console.error('Error disconnecting wallet:', err);
      }
    }
  };

  // HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        <h2>Connect to Phantom Wallet</h2>

        {provider && walletAddress && (
          <div>
            <p>Connected account: {walletAddress}</p>
            <button
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
                position: "absolute",
                top: "28px",
                right: "28px"
              }}
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </button>
          </div>
        )}

        {provider && !walletAddress && (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}

        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
      </header>
    </div>
  );
}
