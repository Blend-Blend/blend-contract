import { ethers } from "hardhat";
import { parseUnits } from "ethers";
import { eArbitrumNetwork, eAvalancheNetwork, eBaseNetwork, eEthereumNetwork, eFantomNetwork, eHarmonyNetwork, eOptimismNetwork, ePolygonNetwork } from "./types";

export const ZERO_BYTES_32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const RESERVE_TOKENS = ["USDC", "USDT", "DAI", "BTC", "ETH", "stBTC", "stETH"];

export const OPTIMAL_UTILIZATION_RATIO_BLUECHIP = ethers.parseUnits("0.75", 27);
export const BASE_BORROW_RATE_BLUECHIP = ethers.parseUnits("0.1", 27);
export const RATE_SLOPE_1_BLUECHIP = ethers.parseUnits("0.08", 27);
export const RATE_SLOPE_2_BLUECHIP = ethers.parseUnits("1", 27);

export const OPTIMAL_UTILIZATION_RATIO_GROWTH = ethers.parseUnits("0.6", 27);
export const BASE_BORROW_RATE_GROWTH = ethers.parseUnits("0.15", 27);
export const RATE_SLOPE_1_GROWTH = ethers.parseUnits("0.15", 27);
export const RATE_SLOPE_2_GROWTH = ethers.parseUnits("1.5", 27);

export const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
export const ONE_DAY_IN_SECS = 3600 * 24;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';


export const MOCK_CHAINLINK_AGGREGATORS_PRICES: { [key: string]: string } = {
  BLEND: parseUnits("300", 8).toString(),
  WETH: parseUnits("4000", 8).toString(),
  ETH: parseUnits("4000", 8).toString(),
  DAI: parseUnits("1", 8).toString(),
  USDC: parseUnits("1", 8).toString(),
  USDT: parseUnits("1", 8).toString(),
  WBTC: parseUnits("60000", 8).toString(),
  USD: parseUnits("1", 8).toString(),
  LINK: parseUnits("30", 8).toString(),
  CRV: parseUnits("6", 8).toString(),
  BAL: parseUnits("19.70", 8).toString(),
  REW: parseUnits("1", 8).toString(),
  EURS: parseUnits("1.126", 8).toString(),
  ONE: parseUnits("0.28", 8).toString(),
  WONE: parseUnits("0.28", 8).toString(),
  WAVAX: parseUnits("86.59", 8).toString(),
  WFTM: parseUnits("2.42", 8).toString(),
  WMATIC: parseUnits("1.40", 8).toString(),
  SUSD: parseUnits("1", 8).toString(),
  SUSHI: parseUnits("2.95", 8).toString(),
  GHST: parseUnits("2.95", 8).toString(),
  AGEUR: parseUnits("1.126", 8).toString(),
  JEUR: parseUnits("1.126", 8).toString(),
  DPI: parseUnits("149", 8).toString(),
  CBETH: parseUnits("4000", 8).toString(),
};

export const ETHEREUM_SHORT_EXECUTOR =
  "0xEE56e2B3D491590B5b31738cC34d5232F378a8D5";

export const EMPTY_STORAGE_SLOT =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const POOL_ADMIN: Record<string, string> = {
  [eArbitrumNetwork.arbitrum]: "0xbbd9f90699c1FA0D7A65870D241DD1f1217c96Eb",
  [eAvalancheNetwork.avalanche]: "0xa35b76E4935449E33C56aB24b23fcd3246f13470",
  [eFantomNetwork.main]: "0x39CB97b105173b56b5a2b4b33AD25d6a50E6c949",
  [eHarmonyNetwork.main]: "0xb2f0C5f37f4beD2cB51C44653cD5D84866BDcd2D",
  [eOptimismNetwork.main]: "0xE50c8C619d05ff98b22Adf991F17602C774F785c",
  [ePolygonNetwork.polygon]: "0xdc9A35B16DB4e126cFeDC41322b3a36454B1F772",
  [eEthereumNetwork.main]: ETHEREUM_SHORT_EXECUTOR,
  [eBaseNetwork.base]: "0xA9F30e6ED4098e9439B2ac8aEA2d3fc26BcEbb45",
  [eBaseNetwork.baseGoerli]: "0xA9F30e6ED4098e9439B2ac8aEA2d3fc26BcEbb45",
  [eEthereumNetwork.tenderly]: ETHEREUM_SHORT_EXECUTOR,
};

export const EMERGENCY_ADMIN: Record<string, string> = {
  [eArbitrumNetwork.arbitrum]: "0xbbd9f90699c1FA0D7A65870D241DD1f1217c96Eb",
  [eAvalancheNetwork.avalanche]: "0xa35b76E4935449E33C56aB24b23fcd3246f13470",
  [eFantomNetwork.main]: "0x39CB97b105173b56b5a2b4b33AD25d6a50E6c949",
  [eHarmonyNetwork.main]: "0xb2f0C5f37f4beD2cB51C44653cD5D84866BDcd2D",
  [eOptimismNetwork.main]: "0xE50c8C619d05ff98b22Adf991F17602C774F785c",
  [ePolygonNetwork.polygon]: "0x1450F2898D6bA2710C98BE9CAF3041330eD5ae58",
  [eEthereumNetwork.main]: ETHEREUM_SHORT_EXECUTOR,
};

export const DEFAULT_NAMED_ACCOUNTS = {
  deployer: {
    default: 0,
  },
  aclAdmin: {
    default: 0,
  },
  emergencyAdmin: {
    default: 0,
  },
  poolAdmin: {
    default: 0,
  },
  addressesProviderRegistryOwner: {
    default: 0,
  },
  treasuryProxyAdmin: {
    default: 1,
  },
  incentivesProxyAdmin: {
    default: 1,
  },
  incentivesEmissionManager: {
    default: 0,
  },
  incentivesRewardsVault: {
    default: 0,
  },
};