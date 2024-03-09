import {
  rateStrategyStableOne,
  rateStrategyStableTwo,
  rateStrategyVolatileOne,
} from "./rateStrategies";
import { ZERO_ADDRESS } from "../constants";
import {
  IMarketConfiguration,
  eEthereumNetwork,
  eArbitrumNetwork,
} from "../types";

import { CommonsConfig } from "./commons";
import {
  strategyDAI,
  strategyUSDC,
  strategyUSDT,
  strategyWBTC,
  strategyWETH,
} from "./reservesConfigs";

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const TestnetMarket: IMarketConfiguration = {
  ...CommonsConfig,
  MarketId: "Testnet Market",
  ProviderId: 8080,
  ReservesConfig: {
    USDT: strategyUSDT,
    DAI: strategyDAI,
    USDC: strategyUSDC,
    WETH: strategyWETH,
    WBTC: strategyWBTC,
  },
  ReserveAssets: {
    [eEthereumNetwork.main]: {
      USDT: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      WBTC: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    },
    [eEthereumNetwork.kovan]: {
      USDT: ZERO_ADDRESS,
      DAI: ZERO_ADDRESS,
      USDC: ZERO_ADDRESS,
      WETH: ZERO_ADDRESS,
      WBTC: ZERO_ADDRESS,
    },
    [eArbitrumNetwork.arbitrumTestnet]: {
      USDT: ZERO_ADDRESS,
      DAI: ZERO_ADDRESS,
      USDC: ZERO_ADDRESS,
      WETH: ZERO_ADDRESS,
      WBTC: ZERO_ADDRESS,
    },
    [eEthereumNetwork.rinkeby]: {
      USDT: ZERO_ADDRESS,
      DAI: ZERO_ADDRESS,
      USDC: ZERO_ADDRESS,
      WETH: ZERO_ADDRESS,
      WBTC: ZERO_ADDRESS,
    },
  },
};

export default TestnetMarket;