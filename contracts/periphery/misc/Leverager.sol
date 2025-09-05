// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {Ownable} from '../../dependencies/openzeppelin/contracts/Ownable.sol';

import {IPool} from '../../interfaces/IPool.sol';
import {DataTypes} from '../../protocol/libraries/types/DataTypes.sol';
import {IWETH} from '../../misc/interfaces/IWETH.sol';
import {IFlashLoanSimpleReceiver} from '../../flashloan/interfaces/IFlashLoanSimpleReceiver.sol';
import {IPoolAddressesProvider} from '../../interfaces/IPoolAddressesProvider.sol';

/// @title Leverager Contract
contract Leverager is Ownable, IFlashLoanSimpleReceiver {
	using SafeERC20 for IERC20;

	/// @notice Ratio Divisor
	uint256 public constant RATIO_DIVISOR = 10000;

	// Max reasonable fee, 1%
	uint256 public constant MAX_REASONABLE_FEE = 100;

	/// @notice Lending Pool address
	IPool public lendingPool;

	/// @notice Wrapped ETH contract address
	IWETH public weth;

	/// @notice Fee ratio
	uint256 public feePercent;

	/// @notice Treasury address
	address public treasury;

	/// @notice Tracks if a rebalance operation is in progress
	bool private inRebalance;

	/// @notice Emitted when fee ratio is updated
	event FeePercentUpdated(uint256 indexed _feePercent);

	/// @notice Emitted when treasury is updated
	event TreasuryUpdated(address indexed _treasury);

	/// @notice Emitted when lending pool is updated
	event LendingPoolUpdated(address indexed _lendingPool);

	/// @notice Emitted when a rebalance operation is executed
	event Rebalance(
		address indexed user,
		address indexed asset,
		uint256 amount
	);

	error AddressZero();

	error ReceiveNotAllowed();

	error FallbackNotAllowed();

	/// @notice Disallow a loop count of 0
	error InvalidLoopCount();

	/// @notice Emitted when ratio is invalid
	error InvalidRatio();

	/// @notice Error when not called by lending pool during flashloan
	error CallerNotPool();

	/// @notice Error when initiator is not this contract
	error InvalidInitiator();

	/// @notice Error when rebalance parameters are invalid
	error InvalidRebalanceParams();

	error InvalidRebalanceStatus(bool rebalanceStatus);

	constructor(
		IPool _lendingPool,
		IWETH _weth,
		uint256 _feePercent,
		address _treasury
	) {
		if (address(_lendingPool) == address(0)) revert AddressZero();
		if (address(_weth) == address(0)) revert AddressZero();
		if (_treasury == address(0)) revert AddressZero();
		if (_feePercent > MAX_REASONABLE_FEE) revert InvalidRatio();
        transferOwnership(msg.sender);

		lendingPool = _lendingPool;
		weth = _weth;
		feePercent = _feePercent;
		treasury = _treasury;
	}

	/**
	 * @dev Only WETH contract is allowed to transfer ETH here. Prevent other addresses to send Ether to this contract.
	 */
	receive() external payable {
		if (msg.sender != address(weth)) revert ReceiveNotAllowed();
	}

	/**
	 * @dev Revert fallback calls
	 */
	fallback() external payable {
		revert FallbackNotAllowed();
	}

	/**
	* @notice Sets lending pool address
	* @param _lendingPool address
	*/
	function setLendingPool(IPool _lendingPool) external onlyOwner {
		if (address(_lendingPool) == address(0)) revert AddressZero();
		lendingPool = _lendingPool;
		emit LendingPoolUpdated(address(_lendingPool));
	}

	/**
	 * @notice Sets fee ratio
	 * @param _feePercent fee ratio.
	 */
	function setFeePercent(uint256 _feePercent) external onlyOwner {
		if (_feePercent > MAX_REASONABLE_FEE) revert InvalidRatio();
		feePercent = _feePercent;
		emit FeePercentUpdated(_feePercent);
	}

	/**
	 * @notice Sets fee ratio
	 * @param _treasury address
	 */
	function setTreasury(address _treasury) external onlyOwner {
		if (_treasury == address(0)) revert AddressZero();
		treasury = _treasury;
		emit TreasuryUpdated(_treasury);
	}

	/**
	 * @dev Loop the deposit and borrow of an asset
	 * @param asset for loop
	 * @param amount for the initial deposit
	 * @param interestRateMode stable or variable borrow mode
	 * @param borrowRatio Ratio of tokens to borrow
	 * @param loopCount Repeat count for loop
	 * @param isBorrow true when the loop without deposit tokens
	 **/
	function loop(
		address asset,
		uint256 amount,
		uint256 interestRateMode,
		uint256 borrowRatio,
		uint256 loopCount,
		bool isBorrow
	) external {
		if (!(borrowRatio > 0 && borrowRatio <= RATIO_DIVISOR)) revert InvalidRatio();
		if (loopCount == 0) revert InvalidLoopCount();
		uint16 referralCode = 0;
		uint256 fee;
		if (!isBorrow) {
			IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
			fee = (amount * feePercent) / RATIO_DIVISOR;
			if (fee > 0) {
				IERC20(asset).safeTransfer(treasury, fee);
				amount = amount - fee;
			}
		}
		_approve(asset);

		if (!isBorrow) {
			lendingPool.supply(asset, amount, msg.sender, referralCode);
		} else {
			amount = (amount * RATIO_DIVISOR) / borrowRatio;
		}

		for (uint256 i = 0; i < loopCount; ) {
			amount = (amount * borrowRatio) / RATIO_DIVISOR;
			lendingPool.borrow(asset, amount, interestRateMode, referralCode, msg.sender);

			fee = (amount * feePercent) / RATIO_DIVISOR;
			if (fee > 0) {
				IERC20(asset).safeTransfer(treasury, fee);
				amount = amount - fee;
			}

			lendingPool.supply(asset, amount, msg.sender, referralCode);
			unchecked {
				i++;
			}
		}
	}

	/**
	 * @dev Loop the deposit and borrow of ETH
	 * @param interestRateMode stable or variable borrow mode
	 * @param borrowRatio Ratio of tokens to borrow
	 * @param loopCount Repeat count for loop
	 **/
	function loopETH(uint256 interestRateMode, uint256 borrowRatio, uint256 loopCount) external payable {
		if (!(borrowRatio > 0 && borrowRatio <= RATIO_DIVISOR)) revert InvalidRatio();
		if (loopCount == 0) revert InvalidLoopCount();
		uint16 referralCode = 0;
		uint256 amount = msg.value;
		_approve(address(weth));

		uint256 fee = (amount * feePercent) / RATIO_DIVISOR;
		if (fee > 0) {
			_safeTransferETH(treasury, fee);
			amount = amount - fee;
		}

		weth.deposit{value: amount}();
		lendingPool.supply(address(weth), amount, msg.sender, referralCode);

		for (uint256 i = 0; i < loopCount; ) {
			amount = (amount * borrowRatio) / RATIO_DIVISOR;
			lendingPool.borrow(address(weth), amount, interestRateMode, referralCode, msg.sender);

			fee = (amount * feePercent) / RATIO_DIVISOR;
			if (fee > 0) {
				weth.withdraw(fee);
				_safeTransferETH(treasury, fee);
				amount = amount - fee;
			}

			lendingPool.supply(address(weth), amount, msg.sender, referralCode);
			unchecked {
				i++;
			}
		}
	}

	/**
	 * @dev Loop the borrow and deposit of ETH
	 * @param interestRateMode stable or variable borrow mode
	 * @param amount initial amount to borrow
	 * @param borrowRatio Ratio of tokens to borrow
	 * @param loopCount Repeat count for loop
	 **/
	function loopETHFromBorrow(
		uint256 interestRateMode,
		uint256 amount,
		uint256 borrowRatio,
		uint256 loopCount
	) external {
		if (!(borrowRatio > 0 && borrowRatio <= RATIO_DIVISOR)) revert InvalidRatio();
		if (loopCount == 0) revert InvalidLoopCount();
		uint16 referralCode = 0;
		_approve(address(weth));

		uint256 fee;

		for (uint256 i = 0; i < loopCount; ) {
			lendingPool.borrow(address(weth), amount, interestRateMode, referralCode, msg.sender);

			fee = (amount * feePercent) / RATIO_DIVISOR;
			if (fee > 0) {
				weth.withdraw(fee);
				_safeTransferETH(treasury, fee);
				amount = amount - fee;
			}

			lendingPool.supply(address(weth), amount, msg.sender, referralCode);

			amount = (amount * borrowRatio) / RATIO_DIVISOR;
			unchecked {
				i++;
			}
		}
	}


	/**
	 * @notice Approves token allowance of `lendingPool` and `treasury`.
	 * @param asset underlyig asset
	 **/
	function _approve(address asset) internal {
		if (IERC20(asset).allowance(address(this), address(lendingPool)) == 0) {
			IERC20(asset).approve(address(lendingPool), type(uint256).max);
		}
		if (IERC20(asset).allowance(address(this), address(treasury)) == 0) {
			IERC20(asset).approve(treasury, type(uint256).max);
		}
	}

    /**
     * @dev transfer ETH to an address, revert if it fails.
     * @param to recipient of the transfer
     * @param value the amount to send
     */
    function _safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, 'ETH_TRANSFER_FAILED');
    }

	/**
	 * @notice Rebalance a leveraged position using flashloan
	 * @param asset The asset to rebalance (asset to repay and withdraw)
	 * @param amount Amount of debt to repay
	 */
	function rebalance(
		address asset,
		uint256 amount
	) external {
		if (amount == 0) revert InvalidRebalanceParams();
		if (asset == address(0)) revert AddressZero();
		if (inRebalance) revert InvalidRebalanceStatus(inRebalance); // Prevent reentrancy

		// Store rebalance state
		inRebalance = true;

		// Encode parameters for flashloan callback
		bytes memory params = abi.encode(msg.sender);

		// Initiate flashloan for the amount to repay
		lendingPool.flashLoanSimple(
			address(this),
			asset,
			amount,
			params,
			0 // referralCode
		);
		
		// Reset state
		inRebalance = false;
		
		// Emit rebalance event
		emit Rebalance(msg.sender, asset, amount);
	}

	/**
	 * @notice Executes the rebalance operation after receiving flashloan
	 * @dev Called by the lending pool during flashloan execution
	 * @param asset The address of the flash-borrowed asset
	 * @param amount The amount of the flash-borrowed asset
	 * @param premium The fee of the flash-borrowed asset
	 * @param initiator The address of the flashloan initiator
	 * @param params The byte-encoded params passed when initiating the flashloan
	 * @return True if the execution of the operation succeeds
	 */
	function executeOperation(
		address asset,
		uint256 amount,
		uint256 premium,
		address initiator,
		bytes calldata params
	) external override returns (bool) {
		// Verify the call is from the lending pool
		if (msg.sender != address(lendingPool)) revert CallerNotPool();
		
		// Verify the initiator is this contract
		if (initiator != address(this)) revert InvalidInitiator();

		if (!inRebalance) revert InvalidRebalanceStatus(inRebalance);
		
		// Decode parameters
		address user = abi.decode(params, (address));
		
		// Ensure we have the tokens from flashloan
		require(IERC20(asset).balanceOf(address(this)) >= amount, "Flashloan not received");
		
		// 1. Approve lending pool to take the repayment amount
		_approve(asset);
		
		// 2. Repay user's debt with the flashloan amount
		lendingPool.repay(asset, amount, 2, user); // 2 = variable rate mode
		
		// 3. Calculate total amount needed to repay flashloan
		// This includes: flashloan amount + flashloan premium + our service fee
		uint256 serviceFee = (amount * feePercent) / RATIO_DIVISOR;
		uint256 totalToWithdraw = amount + premium + serviceFee;
		
		// 4. Get the BToken address for this asset
		DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(asset);
		address bTokenAddress = reserveData.bTokenAddress;
		
		// 5. Transfer BToken from user to this contract
		// User must have approved this contract to transfer their BTokens
		IERC20(bTokenAddress).safeTransferFrom(user, address(this), totalToWithdraw);
		
		// 6. Withdraw the underlying asset from the BToken
		lendingPool.withdraw(asset, totalToWithdraw, address(this));
		
		// 7. Transfer service fee to treasury
		if (serviceFee > 0) {
			IERC20(asset).safeTransfer(treasury, serviceFee);
		}
		
		// 8. Approve pool to pull back flashloan amount + premium
		uint256 amountOwing = amount + premium;
		IERC20(asset).approve(address(lendingPool), amountOwing);
		
		return true;
	}

	/**
	 * @notice Returns the Pool Addresses Provider
	 * @return The addresses provider
	 */
	function ADDRESSES_PROVIDER() external view override returns (IPoolAddressesProvider) {
		return lendingPool.ADDRESSES_PROVIDER();
	}

	/**
	 * @notice Returns the Pool
	 * @return The lending pool
	 */
	function POOL() external view override returns (IPool) {
		return lendingPool;
	}
}
