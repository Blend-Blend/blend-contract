import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { config } from "dotenv";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  await deploy("Errors", { from: deployer }).then((res) => {
    console.log("Errors deployed to: ", res.address, res.newlyDeployed);
  });
  const Errors = await deployments.get("Errors");

  // ——————————————deploy lib-logic————————————————————
  await deploy("SupplyLogic", {
    from: deployer,
  }).then((res) => {
    console.log("SupplyLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const SupplyLogic = await deployments.get("SupplyLogic");

  await deploy("BorrowLogic", {
    from: deployer,
  }).then((res) => {
    console.log("BorrowLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const BorrowLogic = await deployments.get("BorrowLogic");

  await deploy("BridgeLogic", {
    from: deployer,
  }).then((res) => {
    console.log("BridgeLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const BridgeLogic = await deployments.get("BridgeLogic");

  await deploy("ConfiguratorLogic", {
    from: deployer,
  }).then((res) => {
    console.log("ConfiguratorLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const ConfiguratorLogic = await deployments.get("ConfiguratorLogic");


  await deploy("EModeLogic", {
    from: deployer,
  }).then((res) => {
    console.log("EModeLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const EModeLogic = await deployments.get("EModeLogic");


  await deploy("LiquidationLogic", {
    from: deployer,
  }).then((res) => {
    console.log("LiquidationLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const LiquidationLogic = await deployments.get("LiquidationLogic");


  await deploy("FlashLoanLogic", {
    from: deployer,
    libraries: {
      BorrowLogic: BorrowLogic.address,
    },
  }).then((res) => {
    console.log("FlashLoanLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const FlashLoanLogic = await deployments.get("FlashLoanLogic");

  await deploy("PoolLogic", {
    from: deployer,
  }).then((res) => {
    console.log("PoolLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const PoolLogic = await deployments.get("PoolLogic");

  // ——————————————————————————————————————————————————————————

  await deploy("ReserveLogic", {
    from: deployer,
  }).then((res) => {
    console.log("ReserveLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const ReserveLogic = await deployments.get("ReserveLogic");


  await deploy("ValidationLogic", {
    from: deployer,
  }).then((res) => {
    console.log("ReserveLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const ValidationLogic = await deployments.get("ValidationLogic");

  await deploy("GenericLogic", {
    from: deployer,
  }).then((res) => {
    console.log("GenericLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const GenericLogic = await deployments.get("GenericLogic");

  await deploy("IsolationModeLogic", {
    from: deployer,
  }).then((res) => {
    console.log("IsolationModeLogic deployed to: ", res.address, res.newlyDeployed);
  });
  const IsolationModeLogic = await deployments.get("IsolationModeLogic");

  console.log("done!");
};
export default deployFunction;
deployFunction.tags = ["libs"];
