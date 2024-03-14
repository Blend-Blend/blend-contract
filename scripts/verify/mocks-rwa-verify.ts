
import { verifyContract } from "./verify-helper";
import { getBaseURI } from "../../utils/env-utils";
import { REAL_ESTATE_NFTS, FINANCIAL_BOND_NFTS, ARTWORK_NFTS } from "../../utils/constants";
import hre from "hardhat";

const func = async function () {
  const { deployments } = hre;

  //verify MockRWA
  let nfts = [...REAL_ESTATE_NFTS, ...FINANCIAL_BOND_NFTS, ...ARTWORK_NFTS];
  for (const nft of nfts) {
    console.log("\n- Verifying " + nft + "...\n");
    const MockERC721Params :string[] = [
      nft,
      nft.toUpperCase(),
      getBaseURI(nft)
    ];
    // const nftContract = await getDeployedContract("MockRWA", nft);
    const nftContract = await deployments.get(nft);
    await verifyContract(
      "MockRWA",
      nftContract.address,
      "contracts/mocks/MockRWA.sol:MockRWA",
      MockERC721Params
    );
  }

};

func().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
