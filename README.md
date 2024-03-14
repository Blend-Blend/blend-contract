# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

```shell
graph create albin/blend-bevm-testnet --node http://35.239.70.210:8020
graph remove albin/blend-bevm-testnet --node http://35.239.70.210:8020
graph deploy --ipfs http://35.239.70.210:5001 --node http://35.239.70.210:8020 albin/blend-bevm-testnet
```