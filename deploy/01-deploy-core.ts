import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import hre from "hardhat";

import {
  getMockRWA, getMockUSDC, getPunksAddress
} from "../utils/env-utils";
import { REAL_ESTATE_NFTS, FINANCIAL_BOND_NFTS, ARTWORK_NFTS } from "../utils/constants";
import { config } from "dotenv";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  // get libraires
  const Errors = await deployments.get("Errors");
  const CalculationHelpers = await deployments.get("CalculationHelpers");
  const OfferExecutor = await deployments.get("OfferExecutor");
  const OrderExecutor = await deployments.get("OrderExecutor");
  const RefinanceExecutor = await deployments.get("RefinanceExecutor");
  const Signatures = await deployments.get("Signatures");
  const Validator = await deployments.get("Validator");

  // ——————————————————————————————————————————————————————————

  await deploy("LendingV2", {
    from: deployer,
    libraries: {
      Errors: Errors.address,
      Signatures: Signatures.address,
      Validator: Validator.address,
      OfferExecutor: OfferExecutor.address,
      OrderExecutor: OrderExecutor.address,
      RefinanceExecutor: RefinanceExecutor.address,
      CalculationHelpers: CalculationHelpers.address,
    },
  }).then((res) => {
    console.log("LendingV2 deployed to: ", res.address, res.newlyDeployed);
  });
  const LendingV2 = await deployments.get("LendingV2");

  // ——————————————————————————————————————————————————————————
  // Register pools

  //deploy TakerAddressesProviderRegistry
  await deploy("TakerAddressesProviderRegistry", { from: deployer }).then((res) => {
    console.log("TakerAddressesProviderRegistry deployed to: ", res.address, res.newlyDeployed);
  });
  const TakerAddressesProviderRegistry = await deployments.get("TakerAddressesProviderRegistry");
  const RegistryContract = await ethers.getContractAt(
    "TakerAddressesProviderRegistry",
    TakerAddressesProviderRegistry.address
  );

  //deploy TakerAddressesProvider
  await deploy("TakerAddressesProvider", {
    from: deployer,
  }).then((res) => {
    console.log("TakerAddressesProvider deployed to: ", res.address, res.newlyDeployed);
  });
  const TakerAddressesProvider = await deployments.get("TakerAddressesProvider");
  const AddressProviderContract = await ethers.getContractAt(
    "TakerAddressesProvider",
    TakerAddressesProvider.address
  );

  //set lendingV2Id provider to registry
  console.log("Set lendingV2 TakerAddressesProvider to registry ...");
  const lendingV2Id = ethers.encodeBytes32String("lendingV2");
  if (await RegistryContract.isProviderExists(lendingV2Id)) {
    console.log("lendingV2Id provider is exists ...");
    let tx = await RegistryContract.removeAddressesProvider(lendingV2Id);
    await tx.wait().then(() => {
      console.log("Remove lendingV2Id provider from registry done!");
    });
  }
  let tx = await RegistryContract.addAddressesProvider(lendingV2Id, TakerAddressesProvider.address);
  await tx.wait().then(() => {
    console.log("Add lendingV2Id provider to registry done!");
  });

  //set lendingV2Id pool
  tx = await AddressProviderContract.setLendingPoolImpl(LendingV2.address, await getPunksAddress());
  await tx.wait().then(() => {
    console.log("Set lendingpool impl done!");
  });
  const lendingV2 = await ethers.getContractAt("LendingV2", await AddressProviderContract.getLendingPool());
  console.log("Set lendingpool impl done! lendingV2 proxy: ", lendingV2.target);

  //set authorized token USDC
  tx = await lendingV2.setAuthorizedToken(await getMockUSDC(), true);
  await tx.wait().then(() => {
    console.log("set USDC authorized: ", tx.hash);
  });

  //set authorized RWAs
  let ALL_RWA_NFTS = [...REAL_ESTATE_NFTS, ...FINANCIAL_BOND_NFTS, ...ARTWORK_NFTS];

  for (const nft of ALL_RWA_NFTS) {
    tx = await lendingV2.setAuthorizedCollection(getMockRWA(nft), true);
    await tx.wait().then(() => {
      console.log("set nft authorized: ", tx.hash);
    });
  }
};
export default deployFunction;
deployFunction.tags = ["core"];
if (hre.network.name == "hardhat") {
  deployFunction.dependencies = ["mocks", "libs"];
} else {
  deployFunction.dependencies = ["libs"];
}
// deployFunction.dependencies = ["libs"];