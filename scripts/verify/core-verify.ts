
import { verifyContract } from "./verify-helper";
import hre from "hardhat";
import { getPunksAddress } from "../../utils/env-utils";
import { ethers } from "hardhat";

const func = async function () {
  const { getNamedAccounts, deployments } = hre;
  const { deployer } = await getNamedAccounts();

  // get core
  const LendingV2ImplImpl = await deployments.get("LendingV2");
  const Registry = await deployments.get("TakerAddressesProviderRegistry");
  const Provider = await deployments.get("TakerAddressesProvider");

  //verify LendingV2ImplImpl
  console.log("\n- Verifying LendingV2ImplImpl...\n");
  const LendingV2ImplParams :string[] = [];
  await verifyContract(
    "LendingV2",
    LendingV2ImplImpl.address,
    "contracts/core/LendingV2.sol:LendingV2",
    LendingV2ImplParams
  );

  //verify TakerAddressesProviderRegistry
  console.log("\n- Verifying TakerAddressProviderRegistry...\n");
  const TakerAddressesProviderRegistryParams :string[] = [];
  await verifyContract(
    "TakerAddressesProviderRegistry",
    Registry.address,
    "contracts/configuration/TakerAddressProviderRegistry.sol:TakerAddressesProviderRegistry",
    TakerAddressesProviderRegistryParams
  );

  //verify TakerAddressesProvider
  console.log("\n- Verifying TakerAddressesProvider...\n");
  const TakerAddressesProviderParams :string[] = [];
  await verifyContract(
    "TakerAddressesProvider",
    Provider.address,
    "contracts/configuration/TakerAddressProvider.sol:TakerAddressesProvider",
    TakerAddressesProviderParams
  );
  const provider = await ethers.getContractAt(
    "TakerAddressesProvider",
    Provider.address
  );

  //verify LendingPoolV2 proxy
  const lendingV2Proxy = await ethers.getContractAt(
    "LendingV2",
    await provider.getLendingPool()
  );
  console.log("\n- Verifying LendingPool...\n");
  let lendingv2Selector = lendingV2Proxy.interface.encodeFunctionData("initialize", [
    Provider.address,
    await getPunksAddress(),
    deployer,
  ]);
  const LendingV2ProxyParams :string[] = [
    LendingV2ImplImpl.address,
    Provider.address,
    lendingv2Selector
  ];
  await verifyContract(
    "TakerUpgradeableProxy",
    await provider.getLendingPool(),
    "contracts/proxy/TakerUpgradeableProxy.sol:TakerUpgradeableProxy",
    LendingV2ProxyParams
  );

};

func().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
