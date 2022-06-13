pragma solidity >=0.8.0;

import "./CBT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CBTFactory is Ownable {
    mapping(address => bool) whitelist;
    mapping(address => bool) public isCBT;

    event Deployment(address CBT);

    function approve(address who, bool approval) public onlyOwner {
        whitelist[who] = approval;
    }

    function deploy(string calldata name, string calldata symbol)
        public
        returns (address)
    {
        require(whitelist[msg.sender], "not approved");
        CBT newCBT = new CBT(name, symbol);
        newCBT.transferOwnership(msg.sender);
        isCBT[address(newCBT)] = true;
        emit Deployment(address(newCBT));
        return address(newCBT);
    }
}
