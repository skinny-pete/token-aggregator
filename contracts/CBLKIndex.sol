// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

contract CBLKIndex {
    mapping(address => bool) public isCBLK;
    address public fixedFactory;
    address public unfixedFactory;

    constructor(address _fixedFactory, address _unfixedFactory) {
        fixedFactory = _fixedFactory;
        unfixedFactory = _unfixedFactory;
    }

    function setCBLK(address newCBLK) external {
        require(msg.sender == fixedFactory || msg.sender == unfixedFactory, "not factory");
        isCBLK[newCBLK] = true;
    }
}