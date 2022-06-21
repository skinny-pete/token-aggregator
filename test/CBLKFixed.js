const { expect } = require('chai');
const { ethers } = require('hardhat');

const { setupCBLKFixed, mintAndApproveERC20 } = require('../utils');

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
    CBT1 = await CBTFactory.deploy('Carbon Base Tonne: 1', 'CBT1');
    CBT2 = await CBTFactory.deploy('Carbon Base Tonne: 2', 'CBT2');
    CBT3 = await CBTFactory.deploy('Carbon Base Tonne: 3', 'CBT3');
    // Setup with ratio [1, 2, 3] and a deposit by the deployer of [1000, 2000, 3000]
    CBLKFixed = await setupCBLKFixed(
      CBLKFixedFactory,
      [CBT1, CBT2, CBT3],
      [1, 2, 3],
      [
        ethers.utils.parseEther('1000'),
        ethers.utils.parseEther('2000'),
        ethers.utils.parseEther('3000'),
      ],
      deployer
    );
  });

  describe('Deposit', async () => {
    it('Correct state post inital CBT deposit', async () => {
      expect(await CBT1.balanceOf(CBLKFixed.address)).to.equal(ethers.utils.parseEther('1000'));
      expect(await CBT2.balanceOf(CBLKFixed.address)).to.equal(ethers.utils.parseEther('2000'));
      expect(await CBT3.balanceOf(CBLKFixed.address)).to.equal(ethers.utils.parseEther('3000'));
      expect(await CBLKFixed.balances(CBT1.address)).to.equal(ethers.utils.parseEther('1000'));
      expect(await CBLKFixed.balances(CBT2.address)).to.equal(ethers.utils.parseEther('2000'));
      expect(await CBLKFixed.balances(CBT3.address)).to.equal(ethers.utils.parseEther('3000'));
      expect(await CBLKFixed.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('6000'));
    });

    it('Emits `Deposit` event', async () => {
      await CBT1.mint(deployer.address, ethers.utils.parseEther('1000'));
      await CBT1.approve(CBLKFixed.address, ethers.utils.parseEther('1000'));
      await CBT2.mint(deployer.address, ethers.utils.parseEther('1000'));
      await CBT2.approve(CBLKFixed.address, ethers.utils.parseEther('1000'));
      await CBT3.mint(deployer.address, ethers.utils.parseEther('1000'));
      await CBT3.approve(CBLKFixed.address, ethers.utils.parseEther('1000'));
      // These calls are not working so called explicitly above
      // await mintAndApproveERC20(CBT1, ethers.utils.parseEther('1000'), deployer, CBLKFixed);
      // await mintAndApproveERC20(CBT2, ethers.utils.parseEther('1000'), deployer, CBLKFixed);
      // await mintAndApproveERC20(CBT3, ethers.utils.parseEther('1000'), deployer, CBLKFixed);
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
    it('Correct state post withdraw', async () => {
      const CBLKWithdrawal = ethers.utils.parseEther('1000');
      await CBLKFixed.withdraw(CBLKWithdrawal);
      const CBT1Withdrawal = CBLKWithdrawal.div(6);
      const CBT2Withdrawal = CBLKWithdrawal.mul(2).div(6);
      const CBT3Withdrawal = CBLKWithdrawal.mul(3).div(6);
      expect(await CBT1.balanceOf(CBLKFixed.address)).to.equal(
        ethers.utils.parseEther('1000').sub(CBT1Withdrawal)
      );
      expect(await CBT2.balanceOf(CBLKFixed.address)).to.equal(
        ethers.utils.parseEther('2000').sub(CBT2Withdrawal)
      );
      expect(await CBT3.balanceOf(CBLKFixed.address)).to.equal(
        ethers.utils.parseEther('3000').sub(CBT3Withdrawal)
      );
      expect(await CBT1.balanceOf(deployer.address)).to.equal(CBT1Withdrawal);
      expect(await CBT2.balanceOf(deployer.address)).to.equal(CBT2Withdrawal);
      expect(await CBT3.balanceOf(deployer.address)).to.equal(CBT3Withdrawal);
      expect(await CBLKFixed.balances(CBT1.address)).to.equal(
        ethers.utils.parseEther('1000').sub(CBT1Withdrawal)
      );
      expect(await CBLKFixed.balances(CBT2.address)).to.equal(
        ethers.utils.parseEther('2000').sub(CBT2Withdrawal)
      );
      expect(await CBLKFixed.balances(CBT3.address)).to.equal(
        ethers.utils.parseEther('3000').sub(CBT3Withdrawal)
      );
      expect(await CBLKFixed.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('5000'));
      expect(await CBLKFixed.totalSupply()).to.equal(ethers.utils.parseEther('5000'));
    });

    it('Emits `Withdrawal` event', async () => {
      await expect(CBLKFixed.withdraw(ethers.utils.parseEther('1234')))
        .to.emit(CBLKFixed, 'Withdrawal')
        .withArgs(deployer.address, ethers.utils.parseEther('1234'));
    });

    it('Rejects withdrawal with insufficient CBLK', async () => {
      await expect(CBLKFixed.connect(notDeployer).withdraw(ethers.utils.parseEther('10'))).to.be
        .reverted;
    });

    it('Drains to zero', async () => {
      await CBLKFixed.withdraw(ethers.utils.parseEther('1111'));
      await CBLKFixed.withdraw(ethers.utils.parseEther('3271'));
      await CBLKFixed.withdraw(ethers.utils.parseEther('1618'));
      expect(await CBT1.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('1000'));
      expect(await CBT2.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('2000'));
      expect(await CBT3.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('3000'));
      expect(await CBT1.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('1000'));
      expect(await CBT2.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('2000'));
      expect(await CBT3.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('3000'));
    });
  });
});
