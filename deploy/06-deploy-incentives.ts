import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import hre from "hardhat";

import { ZERO_BYTES_32, ZERO_ADDRESS } from "../utils/constants";
import { config } from "dotenv";
import { EMISSION_MANAGER_ID, POOL_ADDRESSES_PROVIDER_ID } from "../utils/deploy-ids";
import { getDeployedContract } from "../utils/env-utils";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;  
  const { save, deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  
  const proxyArtifact = await deployments.getExtendedArtifact(
    "InitializableImmutableAdminUpgradeabilityProxy"
  );
  
  // const provider = await ethers.getContractAt(
  //   "PoolAddressesProvider",
  //   (await deployments.get("PoolAddressesProvider")).address
  // );
  const provider = await getDeployedContract("PoolAddressesProvider", POOL_ADDRESSES_PROVIDER_ID);

  let tx;
  // ————————————————deploy EmissionManager ———————————————————————
  await deploy(EMISSION_MANAGER_ID, {
    contract: "EmissionManager",
    from: deployer,
    args: [deployer],
  }).then((res) => {
    console.log("EmissionManager deployed to: ", res.address, res.newlyDeployed);
  });
  const EmissionManager = await deployments.get(EMISSION_MANAGER_ID);
  const emissionManager = await ethers.getContractAt(
    "EmissionManager",
    EmissionManager.address
  );

  // ————————————————Deploy Incentives RewardsController———————————————————————
  await deploy("RewardsController", {
    from: deployer,
    args: [deployer],
  }).then((res) => {
    console.log("RewardsController deployed to: ", res.address, res.newlyDeployed);
  });
  const RewardsController = await deployments.get("RewardsController");
  const rewardsController = await ethers.getContractAt(
    "RewardsController",
    RewardsController.address
  );
  try {
    tx = await rewardsController.initialize(ZERO_ADDRESS);
    await tx.wait().then(() => {
      console.log("Initialize rewards controller done!");
    });
  } catch (e) {
    console.log("RewardsController already initialized: ");
  }

  const rewardControllerId = ethers.keccak256(ethers.toUtf8Bytes("REWARD_CONTROLLER"));
  const isRewardsProxyPending = (await provider.getAddress(rewardControllerId)) === ZERO_ADDRESS;
  if (isRewardsProxyPending) {
    tx = await provider.setAddressAsProxy(rewardControllerId, RewardsController.address);
    await tx.wait().then(() => {
      console.log("Set rewards controller done!");
    });
  }
  const rewardsProxyAddress = await provider.getAddress(rewardControllerId);
  deployments.log("- Deployed rewards controll Proxy:", rewardsProxyAddress);
  await save("RewardsControllerProxy", {
    ...proxyArtifact,
    address: rewardsProxyAddress,
  });

  if (await emissionManager.getRewardsController() === ZERO_ADDRESS) {
    tx = await emissionManager.setRewardsController(rewardsProxyAddress);
    await tx.wait().then(() => {
      console.log("Set rewards controller to emission manager done!");
    });
  }

};
export default deployFunction;
deployFunction.tags = ["incentives"];
deployFunction.dependencies = ["core"];