import { ethers } from "hardhat";
import { parseUnits } from "ethers";

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
  AAVE: parseUnits("300", 8).toString(),
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