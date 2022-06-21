// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import '../CBLKFixed.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract CBLKFixedFactory is Ownable {
    // mapping(address => bool) whitelist;
    // mapping(address => bool) public isCBLK;
    // event Deployment(address CBLK);
    // constructor() {
    //     approve(msg.sender, true);
    // }
    // function approve(address who, bool approval) public onlyOwner {
    //     whitelist[who] = approval;
    // }
    // function deployFixed(
    //     string calldata name,
    //     string calldata symbol,
    //     address[] calldata tokens,
    //     uint256[] calldata ratios
    // ) public returns (address) {
    //     require(whitelist[msg.sender], 'not approved');
    //     CBLKFixed newCBLK = new CBLKFixed(name, symbol, tokens, ratios);
    //     newCBLK.transferOwnership(msg.sender);
    //     isCBLK[address(newCBLK)] = true;
    //     index.setCBLK(address(newCBLK));
    //     emit Deployment(address(newCBLK));
    //     return address(newCBLK);
    // }
    // function setIndex(address _index) public onlyOwner {
    //     index = CBLKIndex(_index);
    // }
}
