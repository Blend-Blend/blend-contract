import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ]
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    merlinTestnet: {
      url: `https://testnet-rpc.merlinchain.io`,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: [process.env.PRIVATE_KEY || ""],
      gas: 5000000,
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: [process.env.PRIVATE_KEY || ""],
      gas: 5000000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    bob: { default: 1 },
    alice: { default: 2 },
    sam: { default: 3 },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 0,
    bail: true,
  },
};

export default config;
