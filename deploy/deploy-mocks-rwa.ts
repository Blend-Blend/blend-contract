import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { config } from "dotenv";
import { getBaseURI } from "../utils/env-utils";
import { REAL_ESTATE_NFTS, FINANCIAL_BOND_NFTS, ARTWORK_NFTS } from "../utils/constants";
config({ path: "../.env" });

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  let ALL_NFTS = [...REAL_ESTATE_NFTS, ...FINANCIAL_BOND_NFTS, ...ARTWORK_NFTS];

  for (const nft of ALL_NFTS) {
    await deploy(nft, {
      contract: "MockRWA",
      from: deployer,
      args: [nft, nft.toUpperCase(), getBaseURI(nft)],
    }).then((res) => {
      console.log("%s deployed to: %s, %s", nft, res.address, res.newlyDeployed);
    });
  }
};
export default func;
func.tags = ["mocks-rwa"];
