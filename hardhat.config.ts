import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Load the private key, or use a dummy one for localhost so compilation doesn't crash during testing
const PRIVATE_KEY = process.env.PRIVATE_ADMIN_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Local development network
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Avalanche Testnet (Fuji)
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [PRIVATE_KEY],
      chainId: 43113
    },
    // Avalanche Mainnet
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [PRIVATE_KEY],
      chainId: 43114
    }
  },
  etherscan: {
    // Your Snowtrace API key to verify the contract on the block explorer
    apiKey: {
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || ""
    }
  },
  paths: {
    sources: "./contracts",
    artifacts: "./src/lib/web3/artifacts",
    cache: "./src/lib/web3/cache",
  }
};

export default config;