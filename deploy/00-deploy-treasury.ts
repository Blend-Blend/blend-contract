import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import hre from "hardhat";

import { ZERO_BYTES_32, ZERO_ADDRESS, POOL_ADMIN } from "../utils/constants";
import { config } from "dotenv";
import { getParamPerNetwork, loadPoolConfig } from "../utils/market-config-helpers";
import { MARKET_NAME } from "../utils/env";
import { eNetwork } from "../utils/types";
import { getAddress, getDeployedContract } from "../utils/env-utils";
import { EcosystemReserveV2__factory } from "../typechain-types";
import { TREASURY_CONTROLLER_ID, TREASURY_IMPL_ID, TREASURY_PROXY_ID } from "../utils/deploy-ids";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;  
  const { save, deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  const { ReserveFactorTreasuryAddress } = loadPoolConfig(MARKET_NAME);

  const network = (process.env.FORK || hre.network.name) as eNetwork;
  const treasuryAddress = getParamPerNetwork(
    ReserveFactorTreasuryAddress,
    network
  );
  let treasuryOwner = deployer;
  
  // Deploy Treasury proxy
  await deploy(TREASURY_PROXY_ID, {
    contract: "InitializableAdminUpgradeabilityProxy",
    from: deployer,
    args: [],
  }).then((res) => {
    console.log("TREASURY PROXY deployed to: ", res.address, res.newlyDeployed);
  });

  // Deploy Treasury Controller
  await deploy(TREASURY_CONTROLLER_ID, {
    contract: "EcosystemReserveController",
    from: deployer,
    args: [treasuryOwner],
  }).then((res) => {
    console.log("TREASURY CONTROLLER deployed to: ", res.address, res.newlyDeployed);
  });

  // Deploy Treasury implementation and initialize proxy
  await deploy(TREASURY_IMPL_ID, {
    contract: "EcosystemReserveV2",
    from: deployer,
    args: [],
  }).then((res) => {
    console.log("TREASURY IMPL deployed to: ", res.address, res.newlyDeployed);
  });

  const treasuryImpl = await getDeployedContract("EcosystemReserveV2", TREASURY_IMPL_ID);
  try {
    await treasuryImpl.initialize(ZERO_ADDRESS);
  } catch (error) {
    console.error("Error initializing treasury implement:");
  }

  // Initialize proxy
  const treasuryProxy = await getDeployedContract(
    "InitializableAdminUpgradeabilityProxy", 
    TREASURY_PROXY_ID
  );
  const treasuryController = await getDeployedContract(
    "EcosystemReserveController", 
    TREASURY_CONTROLLER_ID
  );

  const initializePayload = treasuryImpl.interface.encodeFunctionData(
    "initialize",
    [treasuryController.target]
  );

  try {
    await treasuryProxy["initialize(address,address,bytes)"](
      treasuryImpl.target,
      treasuryOwner,
      initializePayload
    );
  } catch (error) {
    console.error("Error initializing treasury proxy:");
  }
};
export default deployFunction;
deployFunction.tags = ["treasury"];