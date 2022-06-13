const { expect } = require('chai');
const { ethers } = require('hardhat');

const { mintAndApprove } = require('./utils');

describe('CBLKFixed', () => {
  let CBLKFixedFactory, CBTFactory; // Contract factories
  let CBLKFixed, CBT1, CBT2, CBT3; // Contract instances
  let deployer, notDeployer; // Signers

  before(async () => {
    [deployer, notDeployer] = await ethers.getSigners();
    CBTFactory = await ethers.getContractFactory('CBT');
    CBLKFixedFactory = await ethers.getContractFactory('CBLKFixed');
  });

  beforeEach(async () => {
    // Deploy CBLKFixed with a ratio of 1:2:3 for CBT{1/2/3}
    // Single deposit with amounts = [1000, 2000, and 3000]
    CBT1 = await CBTFactory.deploy('Carbon Base Tonne: 1', 'CBT1');
    CBT2 = await CBTFactory.deploy('Carbon Base Tonne: 2', 'CBT2');
    CBT3 = await CBTFactory.deploy('Carbon Base Tonne: 3', 'CBT3');
    CBLKFixed = await CBLKFixedFactory.deploy(
      'Changeblock',
      'CBLKF-1',
      [CBT1.address, CBT2.address, CBT3.address],
      [1, 2, 3]
    );
    await mintAndApprove(
      [CBT1, CBT2, CBT3],
      [
        ethers.utils.parseEther('1000'),
        ethers.utils.parseEther('2000'),
        ethers.utils.parseEther('3000'),
      ],
      deployer,
      CBLKFixed
    );
    await CBLKFixed.deposit([
      ethers.utils.parseEther('1000'),
      ethers.utils.parseEther('2000'),
      ethers.utils.parseEther('3000'),
    ]);
  });

  describe('Deposit', async () => {
    it('Correct state post inital CBT deposit', async () => {
      expect(await CBT1.balanceOf(CBLKFixed.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBT2.balanceOf(CBLKFixed.address)).to.equal(
        ethers.utils.parseEther('2000')
      );
      expect(await CBT3.balanceOf(CBLKFixed.address)).to.equal(
        ethers.utils.parseEther('3000')
      );
      expect(await CBLKFixed.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('6000')
      );
      expect(await CBLKFixed.totalSupply()).to.equal(
        ethers.utils.parseEther('6000')
      );
      expect(await CBT1.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT2.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT3.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('0')
      );
    });

    it('Emits `Deposit` event', async () => {
      await mintAndApprove(
        [CBT1, CBT2, CBT3],
        [
          ethers.utils.parseEther('30'),
          ethers.utils.parseEther('60'),
          ethers.utils.parseEther('90'),
        ],
        deployer,
        CBLKFixed
      );
      await expect(
        CBLKFixed.deposit([
          ethers.utils.parseEther('30'),
          ethers.utils.parseEther('60'),
          ethers.utils.parseEther('90'),
        ])
      )
        .to.emit(CBLKFixed, 'Deposit')
        .withArgs(deployer.address, [
          ethers.utils.parseEther('30'),
          ethers.utils.parseEther('60'),
          ethers.utils.parseEther('90'),
        ]);
    });

    it('Requires CBT approval', async () => {
      await expect(
        CBLKFixed.deposit([
          ethers.utils.parseEther('30'),
          ethers.utils.parseEther('60'),
          ethers.utils.parseEther('90'),
        ])
      ).to.be.reverted;
    });

    it('Rejects deposits with incorrect CBT ratio', async () => {
      await mintAndApprove(
        [CBT1, CBT2, CBT3],
        [
          ethers.utils.parseEther('30'),
          ethers.utils.parseEther('60'),
          ethers.utils.parseEther('90'),
        ],
        deployer,
        CBLKFixed
      );
      await expect(
        CBLKFixed.deposit([
          ethers.utils.parseEther('30'),
          ethers.utils.parseEther('50'),
          ethers.utils.parseEther('90'),
        ])
      ).to.be.revertedWith('Incorrect ratio of deposited amounts');
    });
  });

  describe('Withdraw', async () => {
    it('Correct state post withdraw', async () => {});

    it('Emits `Withdrawal` event', async () => {});

    it('Rejects withdrawal with insufficient CBLK', async () => {});

    it('Drains to zero', async () => {});
  });
});
