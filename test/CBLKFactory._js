const { expect } = require('chai');
const { ethers } = require('hardhat');

const { mintAndApprove } = require('./utils');

let CBTFactory, CBLKFactoryFactory, CBLKFactory, CBT1, CBT2, CBT3, deployer, user


describe('CBLKFixed', () => {
    before(async () => {
        CBTFactory = await ethers.getContractFactory("CBT");
        CBLKFactoryFactory = await ethers.getContractFactory("CBLKFactory");
        [deployer, user] = await ethers.getSigners();
    })

    beforeEach(async () => {
        CBT1 = await CBTFactory.deploy("CBT1", "CBT1")
        CBT2 = await CBTFactory.deploy("CBT2", "CBT2")
        CBT3 = await CBTFactory.deploy("CBT3", "CBT3")
        CBLKFactory = await CBLKFactoryFactory.deploy()
    })
    it("deploys", async () => {
        // function deployFixed(
        //     string calldata name,
        //     string calldata symbol,
        //     address[] calldata tokens,
        //     uint256[] calldata ratios
        // ) public returns (address) {
        let tokens = [CBT1, CBT2, CBT3].map(x => x.address)
        let ratios = ["0.3", "0.3", "0.4"].map(x => ethers.utils.parseEther(x))
        await CBLKFactory.deployFixed("CBLK1", "CBLK1", tokens, ratios)

        
    })
});