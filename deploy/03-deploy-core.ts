import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import hre from "hardhat";

import { ZERO_BYTES_32, ZERO_ADDRESS } from "../utils/constants";
import { config } from "dotenv";
import { ConfigNames, loadPoolConfig } from "../utils/market-config-helpers";
import { MARKET_NAME } from "../utils/env";
import { eNetwork } from "../utils/types";
import { ACL_MANAGER_ID, ORACLE_ID, POOL_ADDRESSES_PROVIDER_ID, POOL_CONFIGURATOR_IMPL_ID, POOL_CONFIGURATOR_PROXY_ID, POOL_DATA_PROVIDER, POOL_IMPL_ID, POOL_PROXY_ID } from "../utils/deploy-ids";
config({ path: "../.env" });

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;  
  const { save, deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  
  const poolConfig = loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;

  let tx;

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

  await deploy(POOL_ADDRESSES_PROVIDER_ID, {
    contract: "PoolAddressesProvider",
    from: deployer,
    args: ["Commons Blend Market", deployer],
  }).then((res) => {
    console.log("PoolAddressesProvider deployed to: ", res.address, res.newlyDeployed);
  });
  const PoolAddressesProvider = await deployments.get(POOL_ADDRESSES_PROVIDER_ID);
  const provider = await ethers.getContractAt(
    "PoolAddressesProvider",
    PoolAddressesProvider.address
  );

  if ((await registry.getAddressesProviderIdByAddress(PoolAddressesProvider.address)) === BigInt(0)) {
    tx = await registry.registerAddressesProvider(PoolAddressesProvider.address, 8080);
    await tx.wait().then(() => {
      console.log("Add pool address provider to registry done!");
    });
  }

  // ————————————————deploy pool data provider———————————————————————
  await deploy(POOL_DATA_PROVIDER, {
    contract: "PoolDataProvider",
    from: deployer,
    args: [PoolAddressesProvider.address],
  }).then((res) => {
    console.log("PoolDataProvider deployed to: ", res.address, res.newlyDeployed);
  });
  const PoolDataProvider = await deployments.get(POOL_DATA_PROVIDER);

  if ((await provider.getPoolDataProvider()) === ZERO_ADDRESS) {
    tx = await provider.setPoolDataProvider(PoolDataProvider.address);
    await tx.wait().then(() => {
      console.log("Add pool data provider to pool address provider done!");
    });
  }

  // ————————————————deploy acl manager———————————————————————
  // Set ACL admin at AddressesProvider
  const aclAdmin = deployer;  //<<<<<<<<<<<<<<<<
  if ((await provider.getACLAdmin()) === ZERO_ADDRESS) {
    tx = await provider.setACLAdmin(aclAdmin);
    await tx.wait().then(() => {
      console.log("Set ACL admin done!");
    });
  }

  //deploy acl manager contract
  await deploy(ACL_MANAGER_ID, {
    contract: "ACLManager",
    from: deployer,
    args: [PoolAddressesProvider.address],
  }).then((res) => {
    console.log("ACLManager deployed to: ", res.address, res.newlyDeployed);
  });
  const ACLManager = await deployments.get(ACL_MANAGER_ID);
  const aclManager = await ethers.getContractAt("ACLManager", ACLManager.address);

  //Setup ACLManager at pool address provider
  if ((await provider.getACLManager()) === ZERO_ADDRESS) {
    tx = await provider.setACLManager(ACLManager.address);
    await tx.wait().then(() => {
      console.log("Set ACL manager done!");
    });
  }

  //Add PoolAdmin to ACLManager contract
  const poolAdmin = deployer;  //<<<<<<<<<<<<<<<<
  if (!(await aclManager.isPoolAdmin(poolAdmin))) {
    tx = await aclManager.addPoolAdmin(poolAdmin);
    await tx.wait().then(() => {
      console.log("Add pool admin to ACL manager done!");
    });
  }

  //Add EmergencyAdmin  to ACLManager contract
  const emergencyAdmin = deployer;  //<<<<<<<<<<<<<<<<
  if (!(await aclManager.isEmergencyAdmin(emergencyAdmin))) {
    tx = await aclManager.addEmergencyAdmin(emergencyAdmin);
    await tx.wait().then(() => {
      console.log("Add emergency admin to ACL manager done!");
    });
  }

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
  const OracleQuoteUnit = 8;

  await deploy(ORACLE_ID, {
    contract: "ProtocolOracle",
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
  const ProtocolOracle = await deployments.get(ORACLE_ID);
  const oracle = await ethers.getContractAt("ProtocolOracle", ProtocolOracle.address);
  
  if (await provider.getPriceOracle() === ZERO_ADDRESS) {
    tx = await provider.setPriceOracle(ProtocolOracle.address);
    await tx.wait().then(() => {
      console.log("Set price oracle done!");
    });
  }

  // ————————————————deploy pool contract implementation———————————————————————
  await deploy(POOL_IMPL_ID, {
    contract: "Pool",
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
  const Pool = await deployments.get(POOL_IMPL_ID);
  const pool = await ethers.getContractAt("Pool", Pool.address);
  try {
    tx = await pool.initialize(PoolAddressesProvider.address);
    await tx.wait().then(() => {
      console.log("Pool initialize done!");
    });
  } catch (error) {
    console.log("Pool initialize error: ");
  }

  // ————————————————deploy pool configurator implementation———————————————————————
  await deploy(POOL_CONFIGURATOR_IMPL_ID, {
    contract: "PoolConfigurator",
    from: deployer,
    args: [],
    libraries: {
      ConfiguratorLogic: ConfiguratorLogic.address,
    },
  }).then((res) => {
    console.log("PoolConfigurator deployed to: ", res.address, res.newlyDeployed);
  });
  const PoolConfigurator = await deployments.get(POOL_CONFIGURATOR_IMPL_ID);
  const poolConfigurator = await ethers.getContractAt("PoolConfigurator", PoolConfigurator.address);
  try {
    tx = await poolConfigurator.initialize(PoolAddressesProvider.address);
    await tx.wait().then(() => {
      console.log("PoolConfigurator initialize done!");
    });
  } catch (error) {
    console.log("PoolConfigurator initialize error: ");
  }

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
  await save(POOL_PROXY_ID, {
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
  await save(POOL_CONFIGURATOR_PROXY_ID, {
    ...proxyArtifact,
    address: poolConfiguratorProxyAddress,
  });

  // ————————————————set flash loan premium———————————————————————
  const poolConfigProxy = await ethers.getContractAt("PoolConfigurator", poolConfiguratorProxyAddress);
  const poolProxy = await ethers.getContractAt("Pool", poolProxyAddress);
  if ((await poolProxy.FLASHLOAN_PREMIUM_TOTAL()) === BigInt(0)) {
    tx = await poolConfigProxy.updateFlashloanPremiumTotal(
      poolConfig.FlashLoanPremiums.total
    );
    await tx.wait().then(() => {
      console.log("Set flash loan premium total done!");
    });
  }

  if ((await poolProxy.FLASHLOAN_PREMIUM_TO_PROTOCOL()) === BigInt(0)) {
    tx = await poolConfigProxy.updateFlashloanPremiumToProtocol(
      poolConfig.FlashLoanPremiums.protocol
    );
    await tx.wait().then(() => {
      console.log("Set flash loan premium protocol done!");
    });
  }
};
export default deployFunction;
deployFunction.tags = ["core"];
deployFunction.dependencies = ["mocks", "libs"];