import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { config } from "dotenv";
import { getBaseURI, getDeployedContract } from "../utils/env-utils";
import { BLUE_CHIP_NFTS } from "../utils/constants";
config({ path: "../.env" });

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  await deploy("CryptoPunks", {
    contract: "CryptoPunksMarket",
    from: deployer,
  }).then((res) => {
    console.log("CryptoPunks deployed to: %s, %s", res.address, res.newlyDeployed);
  });

  await deploy("MockUSDC", {
    contract: "MockUSDC",
    from: deployer,
  }).then((res) => {
    console.log("MockUSDC deployed to: %s, %s", res.address, res.newlyDeployed);
  });

  // for (const nft of BLUE_CHIP_NFTS) {
  //   await deploy(nft, {
  //     contract: "MockERC721",
  //     from: deployer,
  //     args: [nft, nft.toUpperCase(), getBaseURI(nft)],
  //   }).then((res) => {
  //     console.log("%s deployed to: %s, %s", nft, res.address, res.newlyDeployed);
  //   });
  // }
};
export default func;
func.tags = ["mocks"];
