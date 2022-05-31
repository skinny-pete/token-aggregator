// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CBLK is ERC20, Ownable {
    address[] public tokens;
    mapping(address => uint256) public balances;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function deposit(address[] memory tokens_, uint256[] memory amounts)
        public
        onlyOwner
    {
        uint256 l = tokens_.length;
        require(l == amounts.length);
        uint256 tonnes;
        for (uint256 i = 0; i < l; i++) {
            address token = tokens_[i];
            uint256 amount = amounts[i];
            if (balances[token] == 0) {
                tokens.push(token);
            }
            IERC20(token).transferFrom(msg.sender, address(this), amount);
            balances[token] += amount;
            tonnes += amount;
        }
        _mint(msg.sender, tonnes);
    }

    function withdraw(uint256 amount) public {
        uint256 tonnes;
        uint256 l = tokens.length;
        for (uint256 i = 0; i < l; i++) {
            address token = tokens[i];
            uint256 withdrawal = (balances[token] * amount) / totalSupply();
            IERC20(token).transfer(msg.sender, withdrawal);
            balances[token] -= withdrawal;
            tonnes += amount;
        }
        _burn(msg.sender, tonnes);
    }
}
