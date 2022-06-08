// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract CBLK is ERC20, Ownable {
    // Events
    event Deposit(address[] tokens, uint256[] amounts);
    event Withdrawal(uint256 amount);

    // State Variables
    address[] public underlyingTokens;
    mapping(address => uint256) public underlyingTokenIndexes;
    mapping(address => uint256) public underlyingTokenBalances;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function deposit(address[] memory tokens, uint256[] memory amounts)
        public
        onlyOwner
    {
        uint256 l = tokens.length;
        require(l == amounts.length);
        uint256 total;
        for (uint256 i = 0; i < l; i++) {
            address token = tokens[i];
            if (underlyingTokenBalances[token] == 0) {
                // register token if its pre-deposit balance is zero
                underlyingTokenIndexes[token] == underlyingTokens.length;
                underlyingTokens.push(token);
            }
            uint256 amount = amounts[i];
            IERC20(token).transferFrom(msg.sender, address(this), amount);
            underlyingTokenBalances[token] += amount;
            total += amount;
        }
        _mint(msg.sender, total);
        emit Deposit(tokens, amounts);
    }

    // check what happens as it goes to zero?
    // check overflows

    // Convert an amount of CBLK into underlying tokens
    function withdraw(uint256 amount) public {
        uint256 total;
        uint256 l = underlyingTokens.length;
        uint256 totalSupply_ = totalSupply();
        if (totalSupply_ == amount) {
            for (uint256 i = 0; i < l; i++) {
                address token = underlyingTokens[i];
                IERC20(token).transfer(
                    msg.sender,
                    underlyingTokenBalances[token]
                );
                underlyingTokenBalances[token] = 0;
            }
        } else {
            for (uint256 i = 0; i < l; i++) {
                address token = underlyingTokens[i];
                uint256 withdrawal = (underlyingTokenBalances[token] * amount) /
                    totalSupply();
                IERC20(token).transfer(msg.sender, withdrawal);
                underlyingTokenBalances[token] -= withdrawal;
                if (underlyingTokenBalances[token] == 0) {
                    // remove token if post-withdrawal balance is zero
                    underlyingTokens[
                        underlyingTokenIndexes[token]
                    ] = underlyingTokens[underlyingTokens.length];
                    underlyingTokens.pop();
                }
                total += amount;
            }
        }
        _burn(msg.sender, total);
        emit Withdrawal(amount);
    }
}
