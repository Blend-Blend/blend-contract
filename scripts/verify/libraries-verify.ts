import hre from "hardhat";
import { verifyContract } from "./verify-helper";

const func = async function () {
  const { deployments } = hre;

  // get libraires
  const Errors = await deployments.get("Errors");
  const CalculationHelpers = await deployments.get("CalculationHelpers");
  const OfferExecutor = await deployments.get("OfferExecutor");
  const OrderExecutor = await deployments.get("OrderExecutor");
  const RefinanceExecutor = await deployments.get("RefinanceExecutor");
  const Signatures = await deployments.get("Signatures");
  const Validator = await deployments.get("Validator");

  //verify Errors library
  console.log("\n- Verifying Errors...\n");
  let ErrorsParams :string[] = [];
  await verifyContract(
    "Errors",
    Errors.address,
    "contracts/libraries/Errors.sol:Errors",
    ErrorsParams
  );

  //verify CalculationHelpers library
  console.log("\n- Verifying CalculationHelpers...\n");
  const CalculationHelpersParams :string[] = [];
  await verifyContract(
    "CalculationHelpers", 
    CalculationHelpers.address, 
    "contracts/libraries/CalculationHelpers.sol:CalculationHelpers",    
    CalculationHelpersParams
  );

  //verify OfferExecutor library
  console.log("\n- Verifying OfferExecutor...\n");
  const OfferExecutorParams :string[] = [];
  await verifyContract(
    "OfferExecutor",
    OfferExecutor.address, 
    "contracts/libraries/OfferExecutor.sol:OfferExecutor",
    OfferExecutorParams
  );

  //verify OrderExecutor library
  console.log("\n- Verifying OrderExecutor...\n");
  const OrderExecutorParams :string[] = [];
  await verifyContract(
    "OrderExecutor", 
    OrderExecutor.address, 
    "contracts/libraries/OrderExecutor.sol:OrderExecutor",
    OrderExecutorParams
  );

  //verify RefinanceExecutor library
  console.log("\n- Verifying RefinanceExecutor...\n");
  const RefinanceExecutorParams :string[] = [];
  await verifyContract(
    "RefinanceExecutor", 
    RefinanceExecutor.address, 
    "contracts/libraries/RefinanceExecutor.sol:RefinanceExecutor",
    RefinanceExecutorParams
  );

  //verify Signatures library
  console.log("\n- Verifying Signatures...\n");
  const SignaturesParams :string[] = [];
  await verifyContract(
    "Signatures", 
    Signatures.address, 
    "contracts/libraries/Signatures.sol:Signatures",
    SignaturesParams
  );

  //verify Validator library
  console.log("\n- Verifying Validator...\n");
  const ValidatorParams :string[] = [];
  await verifyContract(
    "Validator", 
    Validator.address,
    "contracts/libraries/Validator.sol:Validator",
    ValidatorParams
  );

};

func().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
