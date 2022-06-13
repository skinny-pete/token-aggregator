// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/// @title Fixed Ratio Changeblock
/// @author Theo Dale & Peter Whitby.
/// @notice CBLK tokens represents a share of an index of CBTs.
/// The CBTs in the index are distributed according to a specific ratio.
/// CBLK tokens are backed 1-1 by CBTs.
contract CBLKFixed is ERC20, Ownable {
    /// @notice The in order addresses of the CBLKs underlying CBT tokens.
    address[] public climateBackedTonnes;

    /// @notice The in order ratio shares of each consituent CBT token.
    uint256[] public ratios;

    // Used in determining input token ratio.
    uint256 ratioSum;

    // -------------------- EVENTS --------------------

    /// @notice CBT to CBLK conversion.
    /// @param depositor The account depositing the CBTs.
    /// @param amounts In order amounts of CBT deposited.
    event Deposit(address indexed depositor, uint256[] amounts);

    /// @notice CBLK to CBT conversion.
    /// @param withdrawer The account redeeming their CBLK.
    /// @param amount Amount of CBLK converted.
    event Withdrawal(address indexed withdrawer, uint256 amount);

    /// @dev Follow CBLK naming conventions.
    /// @param name Name of CBLK.
    /// @param symbol Symbol of CBLK.
    /// @param tokens In order addresses of constituent underlying CBTs.
    /// @param ratios_ In order ratio shares of constituent underlying CBTs.
    constructor(
        string memory name,
        string memory symbol,
        address[] memory tokens,
        uint256[] memory ratios_
    ) ERC20(name, symbol) {
        climateBackedTonnes = tokens;
        ratios = ratios_;
        uint256 ratioSum_ = 0;
        for (uint256 i = 0; i < ratios_.length; i++) {
            ratioSum_ += ratios[i];
        }
        ratioSum = ratioSum_;
    }

    /// @notice Deposit CBTs in correct ratio and gain CBLK.
    /// @dev CBT approval required for the CBLK contract.
    /// @param amounts The in order CBT amounts to deposit.
    function deposit(uint256[] memory amounts) public {
        require(
            amounts.length == climateBackedTonnes.length,
            'Wrong number of input amounts'
        );
        uint256 total = amounts[0];
        uint256[] memory ratios_ = ratios;
        for (uint256 i = 1; i < ratios_.length; i++) {
            require(
                amounts[i] * ratios_[i - 1] == ratios_[i] * amounts[i - 1],
                'Incorrect ratio of deposited amounts'
            );
            total += amounts[i];
        }
        for (uint256 i = 0; i < ratios_.length; i++) {
            IERC20(climateBackedTonnes[i]).transferFrom(
                msg.sender,
                address(this),
                amounts[i]
            );
        }
        emit Deposit(msg.sender, amounts);
        _mint(msg.sender, total);
    }

    /// @notice Swap CBLK into its underlying CBTs
    /// @param amount The amount of CBLK to be converted
    function withdraw(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount);
        uint256 l = climateBackedTonnes.length;
        for (uint256 i = 0; i < l; i++) {
            IERC20(climateBackedTonnes[i]).transfer(
                msg.sender,
                (amount * ratios[i]) / ratioSum
            );
        }
        emit Withdrawal(msg.sender, amount);
        _burn(msg.sender, amount);
    }
}
