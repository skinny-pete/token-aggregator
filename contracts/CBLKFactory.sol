pragma solidity >=0.8.0;

import "./CBLKFixed.sol";
import "./CBLKUnfixed.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CBLKFactory is Ownable {
    mapping(address => bool) whitelist;
    mapping(address => bool) public isCBLK;

    event Deployment(address CBLK);

    constructor() {
        approve(msg.sender, true);
    }

    function approve(address who, bool approval) public onlyOwner {
        whitelist[who] = approval;
    }

    function deploy(
        string calldata name,
        string calldata symbol,
        address[] calldata tokens,
        uint[] calldata ratios
    ) public returns (address) {
        require(whitelist[msg.sender], "not approved");
        CBLKFixed newCBLK = new CBLKFixed(name, symbol, tokens, ratios);
        newCBLK.transferOwnership(msg.sender);
        isCBLK[address(newCBLK)] = true;
        emit Deployment(address(newCBLK));
        return address(newCBLK);
    }

    function deploy(
        string calldata name,
        string calldata symbol,
        address[] calldata tokens
    ) public returns (address) {
        require(whitelist[msg.sender], "not approved");
        CBLKUnfixed newCBLK = new CBLKUnfixed(name, symbol);
        newCBLK.transferOwnership(msg.sender);
        isCBLK[address(newCBLK)] = true;
        emit Deployment(address(newCBLK));
        return address(newCBLK);
    }
}
