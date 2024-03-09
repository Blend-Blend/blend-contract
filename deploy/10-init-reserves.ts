import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import hre from "hardhat";

import { ZERO_BYTES_32, ZERO_ADDRESS } from "../utils/constants";
import { config } from "dotenv";
import { eNetwork, IBlendConfiguration } from "../utils/types";
import { MARKET_NAME } from "../utils/env";
import { ConfigNames, getReserveAddresses, getTreasuryAddress, loadPoolConfig, savePoolTokens } from "../utils/market-config-helpers";
import { getDeployedContractWithDefaultName } from "../utils/env-utils";
import { configureReservesByHelper, initReservesByHelper } from "../utils/init-helpers";
import { POOL_DATA_PROVIDER } from "../utils/deploy-ids";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;  
  const { save, deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  
  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;
  
  const poolConfig = (await loadPoolConfig(
    MARKET_NAME as ConfigNames
  )) as IBlendConfiguration;
  
  const provider = await getDeployedContractWithDefaultName("PoolAddressesProvider");

  const {
    BTokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    ReservesConfig,
    RateStrategies,
  } = poolConfig;

  // Deploy Rate Strategies
  for (const strategy in RateStrategies) {
    const strategyData = RateStrategies[strategy];
    const args = [
      provider.address,
      strategyData.optimalUsageRatio,
      strategyData.baseVariableBorrowRate,
      strategyData.variableRateSlope1,
      strategyData.variableRateSlope2,
      strategyData.stableRateSlope1,
      strategyData.stableRateSlope2,
      strategyData.baseStableRateOffset,
      strategyData.stableRateExcessOffset,
      strategyData.optimalStableToTotalDebtRatio,
    ];
    await deployments.deploy(`ReserveStrategy-${strategyData.name}`, {
      from: deployer,
      args: args,
      contract: "DefaultReserveInterestRateStrategy",
      log: true,
    });
  }


  // Deploy Reserves ATokens
  const treasuryAddress = await getTreasuryAddress(poolConfig, network);
  const incentivesController = await deployments.get("IncentivesProxy");
  const reservesAddresses = await getReserveAddresses(poolConfig, network);

  if (Object.keys(reservesAddresses).length == 0) {
    console.warn("[WARNING] Skipping initialization. Empty asset list.");
    return;
  }

  await initReservesByHelper(
    ReservesConfig,
    reservesAddresses,
    BTokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    deployer,
    treasuryAddress,
    incentivesController.address
  );
  deployments.log(`[Deployment] Initialized all reserves`);

  await configureReservesByHelper(ReservesConfig, reservesAddresses);

  // Save AToken and Debt tokens artifacts
  const dataProvider = await deployments.get(POOL_DATA_PROVIDER);
  await savePoolTokens(reservesAddresses, dataProvider.address);

  deployments.log(`[Deployment] Configured all reserves`);
  return true;
};
export default deployFunction;
deployFunction.tags = ["init-reserves"];
deployFunction.dependencies = ["core", "token"];