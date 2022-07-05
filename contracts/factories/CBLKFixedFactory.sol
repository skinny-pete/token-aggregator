// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import '../CBLKFixed.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract CBLKFixedFactory is Ownable {
    // State variables

    mapping(address => bool) public isCBLKFixed;
    mapping(address => bool) public approvals;

    // Events

    event Deployment(address CBLK);

    event ApprovalSet(address target, bool approval);

    // Methods

    function approve(address target, bool approval) public onlyOwner {
        approvals[target] = approval;
        emit ApprovalSet(target, approval);
    }

    function deploy(
        string calldata name,
        string calldata symbol,
        address[] calldata tokens,
        uint256[] calldata ratios
    ) public returns (address) {
        require(approvals[msg.sender] || msg.sender == owner(), 'Deployment approval required');
        require(tokens.length == ratios.length);
        CBLKFixed cblk = new CBLKFixed(name, symbol, tokens, ratios);
        cblk.transferOwnership(msg.sender);
        isCBLKFixed[address(cblk)] = true;
        emit Deployment(address(cblk));
        return address(cblk);
    }
}
