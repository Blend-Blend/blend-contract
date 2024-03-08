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

  // ——————————————deploy Btoken impl————————————————————
  await deploy("BToken", {
    from: deployer,
  }).then((res) => {
    console.log("BToken deployed to: ", res.address, res.newlyDeployed);
  });
  const BToken = await deployments.get("BToken");

  
  // ——————————————deploy DelegationAwareBToken impl————————————————————
  await deploy("DelegationAwareBToken", {
    from: deployer,
  }).then((res) => {
    console.log("BToken deployed to: ", res.address, res.newlyDeployed);
  });
  const DelegationAwareBToken = await deployments.get("DelegationAwareBToken");
  
  // ——————————————deploy StableDebtToken impl————————————————————
  await deploy("DelegationAwareBToken", {
    from: deployer,
  }).then((res) => {
    console.log("StableDebtToken deployed to: ", res.address, res.newlyDeployed);
  });
  const StableDebtToken = await deployments.get("StableDebtToken");
  
  // ——————————————deploy StableDebtToken impl————————————————————
  await deploy("VariableDebtToken", {
    from: deployer,
  }).then((res) => {
    console.log("VariableDebtToken deployed to: ", res.address, res.newlyDeployed);
  });
  const VariableDebtToken = await deployments.get("VariableDebtToken");

  console.log("done!");
};
export default deployFunction;
deployFunction.tags = ["libs"];
