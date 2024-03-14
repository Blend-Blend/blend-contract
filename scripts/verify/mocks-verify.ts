
import { verifyContract } from "./verify-helper";
import { getBaseURI, getDeployedContract } from "../../utils/env-utils";
import hre from "hardhat";

const func = async function () {
  const { deployments } = hre;

  // get mocks
  const cryptoPunks = await getDeployedContract("CryptoPunksMarket", "CryptoPunks");
  const mockUSDC = await getDeployedContract("MockUSDC", "MockUSDC");
  // const wPunk = await getDeployedContract("WrappedPunk", "WrappedPunk");
  // const cryptoPunks = await deployments.get("CryptoPunks");

  //verify CryptoPunks
  console.log("\n- Verifying CryptoPunks...\n");
  const CryptoPunksParams :string[] = [];
  await verifyContract(
    "CryptoPunksMarket",
    cryptoPunks.target.toString(),
    "contracts/mocks/CryptoPunks.sol:CryptoPunksMarket",
    CryptoPunksParams
  );

  //verify MockUSDC
  console.log("\n- Verifying MockUSDC...\n");
  const MockUSDCParams :string[] = [];
  await verifyContract(
    "MockUSDC",
    mockUSDC.target.toString(),
    "contracts/mocks/MockUSDC.sol:MockUSDC",
    MockUSDCParams
  );

};

func().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
