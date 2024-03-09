import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "../utils/constants";

import { config } from "dotenv";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  const provider = await ethers.getContractAt(
    "PoolAddressesProvider",
    (await deployments.get("PoolAddressesProvider")).address
  );

  const poolProxyAddress = await provider.getPool();

  // ——————————————deploy Btoken impl————————————————————
  await deploy("BToken", {
    from: deployer,
    args: [poolProxyAddress],
  }).then((res) => {
    console.log("BToken deployed to: ", res.address, res.newlyDeployed);
  });
  const BToken = await deployments.get("BToken");
  const bToken = await ethers.getContractAt("BToken", BToken.address);
  let tx = 
    await bToken.initialize(
      poolProxyAddress, // initializingPool
      ZERO_ADDRESS, // treasury
      ZERO_ADDRESS, // underlyingAsset
      ZERO_ADDRESS, // incentivesController
      0, // bTokenDecimals
      "BTOKEN_IMPL", // bTokenName
      "BTOKEN_IMPL", // bTokenSymbol
      "0x00" // params
    );
  console.log("BToken initialized: ", tx.hash);

  
  // ——————————————deploy DelegationAwareBToken impl————————————————————
  await deploy("DelegationAwareBToken", {
    from: deployer,
    args: [poolProxyAddress],
  }).then((res) => {
    console.log("BToken deployed to: ", res.address, res.newlyDeployed);
  });
  const DelegationAwareBToken = await deployments.get("DelegationAwareBToken");
  const delegationAwareBToken = await ethers.getContractAt("DelegationAwareBToken", DelegationAwareBToken.address);
  tx = 
    await delegationAwareBToken.initialize(
      poolProxyAddress, // initializingPool
      ZERO_ADDRESS, // treasury
      ZERO_ADDRESS, // underlyingAsset
      ZERO_ADDRESS, // incentivesController
      0, // bTokenDecimals
      "DELEGATION_AWARE_BTOKEN_IMPL", // bTokenName
      "DELEGATION_AWARE_BTOKEN_IMPL", // bTokenSymbol
      "0x00" // params
    );
  console.log("DelegationAwareBToken initialized: ", tx.hash);
  
  // ——————————————deploy StableDebtToken impl————————————————————
  await deploy("DelegationAwareBToken", {
    from: deployer,
    args: [poolProxyAddress],
  }).then((res) => {
    console.log("StableDebtToken deployed to: ", res.address, res.newlyDeployed);
  });
  const StableDebtToken = await deployments.get("StableDebtToken");
  const stableDebtToken = await ethers.getContractAt("StableDebtToken", StableDebtToken.address);
  tx = 
    await stableDebtToken.initialize(
      poolProxyAddress, // initializingPool
      ZERO_ADDRESS, // underlyingAsset
      ZERO_ADDRESS, // incentivesController
      0, // debtTokenDecimals
      "STABLE_DEBT_TOKEN_IMPL", // debtTokenName
      "STABLE_DEBT_TOKEN_IMPL", // debtTokenSymbol
      "0x00" // params
    );
  console.log("StableDebtToken initialized: ", tx.hash);
  
  // ——————————————deploy StableDebtToken impl————————————————————
  await deploy("VariableDebtToken", {
    from: deployer,
    args: [poolProxyAddress],
  }).then((res) => {
    console.log("VariableDebtToken deployed to: ", res.address, res.newlyDeployed);
  });
  const VariableDebtToken = await deployments.get("VariableDebtToken");
  const variableDebtToken = await ethers.getContractAt("VariableDebtToken", VariableDebtToken.address);
  tx = 
    await variableDebtToken.initialize(
      poolProxyAddress, // initializingPool
      ZERO_ADDRESS, // underlyingAsset
      ZERO_ADDRESS, // incentivesController
      0, // debtTokenDecimals
      "VARIABLE_DEBT_TOKEN_IMPL", // debtTokenName
      "VARIABLE_DEBT_TOKEN_IMPL", // debtTokenSymbol
      "0x00" // params
    );
  console.log("VariableDebtToken initialized: ", tx.hash);

  console.log("done!");
};
export default deployFunction;
deployFunction.tags = ["token"];
deployFunction.dependencies = ["core"];
