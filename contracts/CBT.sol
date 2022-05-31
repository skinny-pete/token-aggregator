// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CBT is ERC20, Ownable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address who, uint256 amount) public onlyOwner {
        _mint(who, amount);
    }

    function burn(address who, uint256 amount) public onlyOwner {
        _burn(who, amount);
    }
}
