import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import hre from "hardhat";

import { ZERO_BYTES_32, ZERO_ADDRESS } from "../utils/constants";
import { config } from "dotenv";
import { getWethAddress } from "../utils/env-utils";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;  
  const { save, deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  
  const provider = await ethers.getContractAt(
    "PoolAddressesProvider",
    (await deployments.get("PoolAddressesProvider")).address
  );

  const poolProxyAddress = await provider.getPool();


  // ————————————————deploy WrappedTokenGatewayV3 ———————————————————————
  const wrappedNativeTokenAddress = getWethAddress();
  await deploy("WrappedTokenGatewayV3", {
    from: deployer,
    args: [wrappedNativeTokenAddress, deployer, poolProxyAddress],
  }).then((res) => {
    console.log("WrappedTokenGatewayV3 deployed to: ", res.address, res.newlyDeployed);
  });

  // ————————————————Deploy WalletBalanceProvider———————————————————————
  await deploy("WalletBalanceProvider", {
    from: deployer,
  }).then((res) => {
    console.log("WalletBalanceProvider deployed to: ", res.address, res.newlyDeployed);
  });

  

};
export default deployFunction;
deployFunction.tags = ["periphery"];
deployFunction.dependencies = ["core"];