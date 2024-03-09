import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import hre from "hardhat";

import { ZERO_BYTES_32, ZERO_ADDRESS } from "../utils/constants";
import { config } from "dotenv";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;  
  const { save, deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  // get libraires
  const LiquidationLogic = await deployments.get("LiquidationLogic");
  const SupplyLogic = await deployments.get("SupplyLogic");
  const EModeLogic = await deployments.get("EModeLogic");
  const FlashLoanLogic = await deployments.get("FlashLoanLogic");
  const BorrowLogic = await deployments.get("BorrowLogic");
  const BridgeLogic = await deployments.get("BridgeLogic");
  const PoolLogic = await deployments.get("PoolLogic");
  const ConfiguratorLogic = await deployments.get("ConfiguratorLogic");  
  
  const proxyArtifact = await deployments.getExtendedArtifact(
    "InitializableImmutableAdminUpgradeabilityProxy"
  );

  // ————————————————deploy pool address provider registry———————————————————————

  // const addressesProviderRegistryOwner = deploy;
  await deploy("PoolAddressesProviderRegistry", {
    from: deployer,
    args: [deployer],
  }).then((res) => {
    console.log("PoolAddressesProviderRegistry deployed to: ", res.address, res.newlyDeployed);
  });
  const PoolAddressesProviderRegistry = await deployments.get("PoolAddressesProviderRegistry");
  const registry = await ethers.getContractAt(
    "PoolAddressesProviderRegistry",
    PoolAddressesProviderRegistry.address
  );

  // ————————————————deploy pool address provider———————————————————————

  await deploy("PoolAddressesProvider", {
    from: deployer,
    args: ["Commons Blend Market", deployer],
  }).then((res) => {
    console.log("PoolAddressesProvider deployed to: ", res.address, res.newlyDeployed);
  });
  const PoolAddressesProvider = await deployments.get("PoolAddressesProvider");
  const provider = await ethers.getContractAt(
    "PoolAddressesProvider",
    PoolAddressesProvider.address
  );

  let tx = await registry.registerAddressesProvider(PoolAddressesProvider.address, 8080);
  await tx.wait().then(() => {
    console.log("Add pool address provider to registry done!");
  });

  // ————————————————deploy pool data provider———————————————————————
  await deploy("ProtocolDataProvider", {
    from: deployer,
    args: [PoolAddressesProvider.address],
  }).then((res) => {
    console.log("ProtocolDataProvider deployed to: ", res.address, res.newlyDeployed);
  });
  const ProtocolDataProvider = await deployments.get("ProtocolDataProvider");

  tx = await provider.setPoolDataProvider(ProtocolDataProvider.address);
  await tx.wait().then(() => {
    console.log("Add pool data provider to pool address provider done!");
  });

  // ————————————————deploy acl manager———————————————————————
  // Set ACL admin at AddressesProvider
  const aclAdmin = deployer;  //<<<<<<<<<<<<<<<<
  tx = await provider.setACLAdmin(aclAdmin);
  await tx.wait().then(() => {
    console.log("Set ACL admin done!");
  });

  //deploy acl manager contract
  await deploy("ACLManager", {
    from: deployer,
    args: [PoolAddressesProvider.address],
  }).then((res) => {
    console.log("ACLManager deployed to: ", res.address, res.newlyDeployed);
  });
  const ACLManager = await deployments.get("ACLManager");
  const aclManager = await ethers.getContractAt("ACLManager", ACLManager.address);

  //Setup ACLManager at pool address provider
  tx = await provider.setACLManager(ACLManager.address);
  await tx.wait().then(() => {
    console.log("Set ACL manager done!");
  });

  //Add PoolAdmin to ACLManager contract
  const poolAdmin = deployer;  //<<<<<<<<<<<<<<<<
  tx = await aclManager.addPoolAdmin(poolAdmin);
  await tx.wait().then(() => {
    console.log("Add pool admin to ACL manager done!");
  });

  //Add EmergencyAdmin  to ACLManager contract
  const emergencyAdmin = deployer;  //<<<<<<<<<<<<<<<<
  tx = await aclManager.addEmergencyAdmin(emergencyAdmin);

  //check ACLManager status
  const isACLAdmin = await aclManager.hasRole(ZERO_BYTES_32, aclAdmin);
  const isPoolAdmin = await aclManager.isPoolAdmin(poolAdmin);
  const isEmergencyAdmin = await aclManager.isEmergencyAdmin(emergencyAdmin);

  if (!isACLAdmin) throw "[ACL][ERROR] ACLAdmin is not setup correctly";
  if (!isPoolAdmin) throw "[ACL][ERROR] PoolAdmin is not setup correctly";
  if (!isEmergencyAdmin)
    throw "[ACL][ERROR] EmergencyAdmin is not setup correctly";
  console.log("== Market Admins ==");
  console.log("- ACL Admin", aclAdmin);
  console.log("- Pool Admin", poolAdmin);
  console.log("- Emergency Admin", emergencyAdmin);

  // ————————————————deploy oracle———————————————————————

  const assets = [ZERO_ADDRESS];
  const sources = [ZERO_ADDRESS];
  const fallbackOracleAddress = ZERO_ADDRESS;
  const OracleQuoteUnit = "8";

  await deploy("ProtocolOracle", {
    from: deployer,
    args: [
      PoolAddressesProvider.address,
      assets,
      sources,
      fallbackOracleAddress,
      ZERO_ADDRESS,
      ethers.parseUnits("1", OracleQuoteUnit),
    ],
  }).then((res) => {
    console.log("ProtocolOracle deployed to: ", res.address, res.newlyDeployed);
  });
  const ProtocolOracle = await deployments.get("ProtocolOracle");
  const oracle = await ethers.getContractAt("ProtocolOracle", ProtocolOracle.address);
  
  tx = await provider.setPriceOracle(ProtocolOracle.address);
  await tx.wait().then(() => {
    console.log("Set price oracle done!");
  });

  // ————————————————deploy pool contract implementation———————————————————————
  await deploy("Pool", {
    from: deployer,
    args: [PoolAddressesProvider.address],
    libraries: {
      LiquidationLogic: LiquidationLogic.address,
      SupplyLogic: SupplyLogic.address,
      EModeLogic: EModeLogic.address,
      FlashLoanLogic: FlashLoanLogic.address,
      BorrowLogic: BorrowLogic.address,
      BridgeLogic: BridgeLogic.address,
      PoolLogic: PoolLogic.address,
    },
  }).then((res) => {
    console.log("Pool deployed to: ", res.address, res.newlyDeployed);
  });
  const Pool = await deployments.get("Pool");
  const pool = await ethers.getContractAt("Pool", Pool.address);
  tx = await pool.initialize(PoolAddressesProvider.address);

  // ————————————————deploy pool configurator implementation———————————————————————
  await deploy("PoolConfigurator", {
    from: deployer,
    args: [],
    libraries: {
      ConfiguratorLogic: ConfiguratorLogic.address,
    },
  }).then((res) => {
    console.log("PoolConfigurator deployed to: ", res.address, res.newlyDeployed);
  });
  const PoolConfigurator = await deployments.get("PoolConfigurator");
  const poolConfig = await ethers.getContractAt("PoolConfigurator", PoolConfigurator.address);
  tx = await poolConfig.initialize(PoolAddressesProvider.address);

  // ————————————————init pool———————————————————————
  const isPoolProxyPending = (await provider.getPool()) === ZERO_ADDRESS;
  if (isPoolProxyPending) {
    tx = await provider.setPoolImpl(Pool.address);
    await tx.wait().then(() => {
      console.log("Set pool done!");
    });
  }
  const poolProxyAddress = await provider.getPool();
  deployments.log("- Deployed Pool Proxy:", poolProxyAddress);
  await save("PoolProxy", {
    ...proxyArtifact,
    address: poolProxyAddress,
  });

  // ————————————————init pool configurator———————————————————————
  const isPoolConfiguratorProxyPending = (await provider.getPoolConfigurator()) === ZERO_ADDRESS;
  if (isPoolConfiguratorProxyPending) {
    tx = await provider.setPoolConfiguratorImpl(PoolConfigurator.address);
    await tx.wait().then(() => {
      console.log("Set pool configurator done!");
    });
  }
  const poolConfiguratorProxyAddress = await provider.getPoolConfigurator();
  deployments.log("- Deployed Pool Configurator Proxy:", poolConfiguratorProxyAddress);
  await save("PoolConfiguratorProxy", {
    ...proxyArtifact,
    address: poolConfiguratorProxyAddress,
  });

  // ————————————————set flash loan premium———————————————————————
  //<<<<<<<<<<<<<<<<<<<<<<<<<<<
  const flashLoanPremiumTotal = 0.0005e4;
  const flashLoanPremiumProtocol = 0.0004e4;
  const poolConfigProxy = await ethers.getContractAt("PoolConfigurator", poolConfiguratorProxyAddress);
  tx = await poolConfigProxy.updateFlashloanPremiumTotal(flashLoanPremiumTotal);
  await tx.wait().then(() => {
    console.log("Set flash loan premium total done!");
  });
  tx = await poolConfigProxy.updateFlashloanPremiumToProtocol(flashLoanPremiumProtocol);
  await tx.wait().then(() => {
    console.log("Set flash loan premium protocol done!");
  });
};
export default deployFunction;
deployFunction.tags = ["core"];
deployFunction.dependencies = ["mocks", "libs"];