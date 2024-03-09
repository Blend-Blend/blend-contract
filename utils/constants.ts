import { ethers } from "hardhat";

export const ZERO_BYTES_32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const BLUE_CHIP_NFTS: string[] = ["azuki", "mayc", "bayc"];
export const GROWTH_NFTS: string[] = ["doodles", "clonex", "cool_cats", "world_of_women"];
export const REAL_ESTATE_NFTS: string[] = ["singapore_apartment", "american_land", "american_house", "uk_house", "australia_house"];
export const FINANCIAL_BOND_NFTS: string[] = ["avCLS", "avPROM", "icDODO", "icPRQ", "vvDOP", "goefs"];
export const ARTWORK_NFTS: string[] = ["vincent_willem_van_gogh", "pablo_picasso", "oscar_claude_monet", "michelangelo", "salvador_dali"];

export const OPTIMAL_UTILIZATION_RATIO_BLUECHIP = ethers.parseUnits("0.75", 27);
export const BASE_BORROW_RATE_BLUECHIP = ethers.parseUnits("0.1", 27);
export const RATE_SLOPE_1_BLUECHIP = ethers.parseUnits("0.08", 27);
export const RATE_SLOPE_2_BLUECHIP = ethers.parseUnits("1", 27);

export const OPTIMAL_UTILIZATION_RATIO_GROWTH = ethers.parseUnits("0.6", 27);
export const BASE_BORROW_RATE_GROWTH = ethers.parseUnits("0.15", 27);
export const RATE_SLOPE_1_GROWTH = ethers.parseUnits("0.15", 27);
export const RATE_SLOPE_2_GROWTH = ethers.parseUnits("1.5", 27);

export const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
export const ONE_DAY_IN_SECS = 3600 * 24;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const LOAN_OFFER_TYPERS = {
  LoanOffer: [
      { name: 'lender', type: 'address' },
      { name: 'collection', type: 'address' },
      { name: 'allTokenId', type: 'bool' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'loanToken', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'maxAmount', type: 'uint256' },
      { name: 'loanRate', type: 'uint256' },
      { name: 'loanDuration', type: 'uint256' },
      { name: 'expirationTime', type: 'uint256' },
      { name: 'salt', type: 'uint256' },
      { name: 'nonce', type: 'uint256' }
  ]
};
export const BORROW_OFFER_TYPERS = {
  BorrowOffer: [
      { name: 'borrower', type: 'address' },
      { name: 'collection', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'loanToken', type: 'address' },
      { name: 'loanAmount', type: 'uint256' },
      { name: 'loanRate', type: 'uint256' },
      { name: 'loanDuration', type: 'uint256' },
      { name: 'expirationTime', type: 'uint256' },
      { name: 'salt', type: 'uint256' },
      { name: 'nonce', type: 'uint256' }
  ]
};

export enum TokenType {
  ERC20 = 0,
  ERC721,
  ERC1155,
}