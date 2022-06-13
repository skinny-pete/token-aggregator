pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CBLKFixed is ERC20, Ownable {
    uint ratioSum;
    uint l;

    uint PRECISION = 10**18;

    address[] public tokens;
    uint[] public ratios;

    constructor(
        string memory name,
        string memory symbol,
        address[] memory _tokens,
        uint[] memory _ratios
    ) ERC20(name, symbol) {
        tokens = _tokens;
        ratios = _ratios;

        for (uint i = 0; i < ratios.length; i++) {
            ratioSum += ratios[i];
        }
        l = ratios.length;
    }

    function deposit(uint[] memory amounts) public {
        require(amounts.length == tokens.length);
        uint total = 0;
        if (l > 1) {
            total += amounts[0];
            for (uint i = 1; i < amounts.length; i++) {
                require(
                    amounts[i] / amounts[i - 1] == ratios[i] / ratios[i - 1],
                    "Incorrect deposit ratio"
                );
                total += amounts[i];
            }
        } else {
            total = amounts[0];
        }

        for (uint i = 0; i < amounts.length; i++) {
            IERC20(tokens[i]).transferFrom(
                msg.sender,
                address(this),
                amounts[i]
            );
        }

        _mint(msg.sender, total);
    }

    function withdraw(uint amount) public {
        require(balanceOf(msg.sender) >= amount);
        for (uint i = 0; i < l; i++) {
            IERC20(tokens[i]).transfer(
                msg.sender,
                ((amount * ratios[i] * PRECISION) / ratioSum) / PRECISION
            );
        }

        _burn(msg.sender, amount);
    }
}
