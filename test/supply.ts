import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  getDeployedContract,
} from "../utils/env-utils";
import {
  TestnetERC20,
  Pool,
  Faucet,
} from "../typechain-types";
import { FAUCET_OWNABLE_ID, POOL_ADDRESSES_PROVIDER_ID } from "../utils/deploy-ids";
import { Facet } from "hardhat-deploy/types";

describe("Supply", function () {
  let usdt: TestnetERC20;
  let usdc: TestnetERC20;
  let pool: Pool;
  let faucet: Faucet;
  async function createEnvFixture() {
    const { deployments, getNamedAccounts } = hre;
    await deployments.fixture(["init-oracle", "init-reserves", "periphery"]);
    const { deployer, bob, alice } = await getNamedAccounts();
    
    const provider = await getDeployedContract("PoolAddressesProvider", POOL_ADDRESSES_PROVIDER_ID);

    console.log("AddressProviderContract address: ", provider.target);
  
    pool = await ethers.getContractAt("Pool", await provider.getPool()) as unknown as Pool;
    console.log("pool proxy: ", pool.target);
  
    const dataProvider = await ethers.getContractAt("PoolDataProvider", await provider.getPoolDataProvider());
    console.log("dataProvider: ", dataProvider.target);
  
    faucet = await getDeployedContract("Faucet", FAUCET_OWNABLE_ID) as unknown as Faucet;
    usdt = await getDeployedContract("TestnetERC20", "USDT") as unknown as TestnetERC20;
    usdc = await getDeployedContract("TestnetERC20", "USDC") as unknown as TestnetERC20;
    console.log("faucet: ", faucet.target);
    await faucet.mint(usdt.target, alice, ethers.parseUnits("5", await usdt.decimals()));
    await faucet.mint(usdc.target, bob, ethers.parseUnits("10", await usdc.decimals()));
    console.log("alice usdt balance: ", await usdt.balanceOf(alice));
    console.log("bob usdt balance: ", await usdt.balanceOf(bob));

    const oracle = await ethers.getContractAt("ProtocolOracle", await provider.getPriceOracle());
    
  }

  it("alice deposit 5 usdt, bob deposit 10 usdc", async function () {
    await loadFixture(createEnvFixture);
    const [deployer, bob, alice] = await ethers.getSigners();

    console.log("alice usdt balance: ", await usdt.balanceOf(alice.address));
    console.log("bob usdt balance: ", await usdt.balanceOf(bob.address));
    await usdt.connect(alice).approve(pool.target, 100);
    await pool.connect(alice).supply(usdt.target, 5, alice.address, 0);

    await usdc.connect(bob).approve(pool.target, 100);
    await pool.connect(bob).supply(usdc.target, 10, bob.address, 0);

    // await pool.connect(alice).setUserUseReserveAsCollateral(usdt.target, true);

    await pool.connect(alice).borrow(usdc.target, 1, 2, 0, alice.address);

    await usdc.connect(alice).approve(pool.target, 100);
    await pool.connect(alice).repay(usdc.target, 1, 2, alice.address);
  });

});
