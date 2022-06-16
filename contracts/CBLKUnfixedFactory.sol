// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import './CBLKUnfixed.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './CBLKIndex.sol';

contract CBLKUnfixedFactory is Ownable {
    mapping(address => bool) whitelist;
    mapping(address => bool) public isCBLK;

    CBLKIndex index;

    event Deployment(address CBLK);

    constructor() {
        approve(msg.sender, true);
    }

    function approve(address who, bool approval) public onlyOwner {
        whitelist[who] = approval;
    }

    function deployUnfixed(string calldata name, string calldata symbol)
        public
        returns (address)
    {
        require(whitelist[msg.sender], 'not approved');
        CBLKUnfixed newCBLK = new CBLKUnfixed(name, symbol);
        newCBLK.transferOwnership(msg.sender);
        isCBLK[address(newCBLK)] = true;
        index.setCBLK(address(newCBLK));
        emit Deployment(address(newCBLK));
        return address(newCBLK);
    }

    function setIndex(address _index) public onlyOwner {
        index = CBLKIndex(_index);
    }
}
