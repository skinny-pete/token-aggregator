const { expect } = require('chai');
const { ethers } = require('hardhat');

const { mintAndApprove } = require('./utils');

describe('CBLK', () => {
  let CBLKFactory, CBTFactory; // Contract factories
  let CBLK, CBT1, CBT2, CBT3; // Contract instances
  let deployer, notDeployer; // Signers

  before(async () => {
    [deployer, notDeployer] = await ethers.getSigners();
    CBTFactory = await ethers.getContractFactory('ClimateBackedTonne');
    CBLKFactory = await ethers.getContractFactory('Changeblock');
  });

  beforeEach(async () => {
    // Setup CBLK with 1000 of each CBT
    CBLK = await CBLKFactory.deploy('Changeblock', 'CBLK');
    CBT1 = await CBTFactory.deploy('Carbon Base Tonne: 1', 'CBT1');
    CBT2 = await CBTFactory.deploy('Carbon Base Tonne: 2', 'CBT2');
    CBT3 = await CBTFactory.deploy('Carbon Base Tonne: 3', 'CBT3');
    await mintAndApprove(
      [CBT1, CBT2, CBT3],
      [
        ethers.utils.parseEther('1000'),
        ethers.utils.parseEther('1000'),
        ethers.utils.parseEther('1000'),
      ],
      deployer,
      CBLK
    );
    await CBLK.rebalance(
      [CBT1.address, CBT2.address, CBT3.address],
      [
        ethers.utils.parseEther('1000'),
        ethers.utils.parseEther('1000'),
        ethers.utils.parseEther('1000'),
      ],
      [],
      []
    );
  });

  describe('Rebalance', async () => {
    it('Correct state post inital CBT deposits', async () => {
      expect(await CBT1.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBT2.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBT3.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBLK.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('3000')
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
      expect(await CBLK.climateBackedTonnes(0)).to.equal(CBT1.address);
      expect(await CBLK.climateBackedTonnes(1)).to.equal(CBT2.address);
      expect(await CBLK.climateBackedTonnes(2)).to.equal(CBT3.address);
    });

    it('Emits `Rebalance` event ', async () => {
      await mintAndApprove(
        [CBT2],
        [ethers.utils.parseEther('250')],
        deployer,
        CBLK
      );
      await expect(
        CBLK.rebalance(
          [CBT2.address],
          [ethers.utils.parseEther('250')],
          [CBT1.address, CBT3.address],
          [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
        )
      )
        .to.emit(CBLK, 'Rebalance')
        .withArgs(
          [CBT2.address],
          [ethers.utils.parseEther('250')],
          [CBT1.address, CBT3.address],
          [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
        );
    });

    it('Rebalance with equal input and output', async () => {
      await mintAndApprove(
        [CBT2],
        [ethers.utils.parseEther('100')],
        deployer,
        CBLK
      );
      await CBLK.rebalance(
        [CBT2.address],
        [ethers.utils.parseEther('100')],
        [CBT1.address, CBT3.address],
        [ethers.utils.parseEther('50'), ethers.utils.parseEther('50')]
      );
      expect(await CBT1.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('950')
      );
      expect(await CBT2.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('1100')
      );
      expect(await CBT3.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('950')
      );
      expect(await CBLK.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('3000')
      );
      expect(await CBT1.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('50')
      );
      expect(await CBT2.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT3.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('50')
      );
    });

    it('Requires CBLK burn when output > input', async () => {
      await mintAndApprove(
        [CBT2],
        [ethers.utils.parseEther('100')],
        deployer,
        CBLK
      );
      await CBLK.rebalance(
        [CBT2.address],
        [ethers.utils.parseEther('100')],
        [CBT1.address, CBT3.address],
        [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
      );
      expect(await CBT1.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('900')
      );
      expect(await CBT2.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('1100')
      );
      expect(await CBT3.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('900')
      );
      expect(await CBLK.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('2900')
      );
      expect(await CBT1.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('100')
      );
      expect(await CBT2.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT3.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('100')
      );
    });

    it('Mints CBLK when input > output', async () => {
      await mintAndApprove(
        [CBT2],
        [ethers.utils.parseEther('500')],
        deployer,
        CBLK
      );
      await CBLK.rebalance(
        [CBT2.address],
        [ethers.utils.parseEther('500')],
        [CBT1.address, CBT3.address],
        [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
      );
      expect(await CBT1.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('900')
      );
      expect(await CBT2.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('1500')
      );
      expect(await CBT3.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('900')
      );
      expect(await CBLK.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('3300')
      );
      expect(await CBT1.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('100')
      );
      expect(await CBT2.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT3.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('100')
      );
    });

    it('Requires sufficient CBT approval ', async () => {
      await expect(
        CBLK.rebalance(
          [CBT2.address],
          [ethers.utils.parseEther('500')],
          [CBT1.address, CBT3.address],
          [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
        )
      ).to.be.reverted;
    });

    it('Introduction of new token', async () => {
      const CBT4 = await CBTFactory.deploy('Carbon Base Tonne: 4', 'CBT4');
      await mintAndApprove(
        [CBT4],
        [ethers.utils.parseEther('1000')],
        deployer,
        CBLK
      );
      await CBLK.rebalance(
        [CBT4.address],
        [ethers.utils.parseEther('1000')],
        [],
        []
      );
      expect(await CBT4.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBLK.climateBackedTonnes(3)).to.equal(CBT4.address);
    });

    it('De-registers token on removal', async () => {
      await CBLK.rebalance(
        [],
        [],
        [CBT1.address],
        [ethers.utils.parseEther('1000')]
      );
      expect(await CBLK.climateBackedTonnes(0)).to.equal(CBT3.address);
      expect(await CBLK.climateBackedTonnes(1)).to.equal(CBT2.address);
      await expect(CBLK.climateBackedTonnes(2)).to.be.reverted;
    });
  });

  describe('Withdraw', () => {
    it('Complete withdrawal', async () => {
      await expect(CBLK.withdraw(ethers.utils.parseEther('3000')));
      expect(await CBT1.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT2.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT3.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBLK.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT1.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBT2.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBT3.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      await expect(CBLK.climateBackedTonnes(0)).to.be.reverted;
    });

    // Check dust amounts are as understood
    it('Partial withdrawal', async () => {
      await CBLK.withdraw(ethers.utils.parseEther('1250'));
      expect(await CBT1.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1250').mul('1000').div('3000')
      );
      expect(await CBT2.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1250').mul('1000').div('3000')
      );
      expect(await CBT3.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1250').mul('1000').div('3000')
      );
      expect(await CBLK.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1750')
      );
      expect(await CBLK.totalSupply()).to.equal(
        ethers.utils.parseEther('1750')
      );
    });
    it('Emits `Withdrawal` event ', async () => {
      await expect(CBLK.withdraw(ethers.utils.parseEther('1000')))
        .to.emit(CBLK, 'Withdrawal')
        .withArgs(deployer.address, [
          ethers.utils.parseEther('1000').mul('1000').div('3000'),
          ethers.utils.parseEther('1000').mul('1000').div('3000'),
          ethers.utils.parseEther('1000').mul('1000').div('3000'),
        ]);
    });

    it('Rejects withdrawal with insufficient CBLK', async () => {
      await expect(
        CBLK.connect(notDeployer).withdraw(ethers.utils.parseEther('1000'))
      ).to.be.revertedWith('ERC20: burn amount exceeds balance');
      await expect(
        CBLK.withdraw(ethers.utils.parseEther('4000'))
      ).to.be.revertedWith('ERC20: burn amount exceeds balance');
    });

    it('De-registers tokens on removal', async () => {
      await CBLK.withdraw(ethers.utils.parseEther('3000'));
      await expect(CBLK.climateBackedTonnes(0)).to.be.reverted;
    });

    it('Dust is collected by last withdrawer', async () => {
      await CBLK.withdraw(ethers.utils.parseEther('1234'));
      await CBLK.withdraw(ethers.utils.parseEther('1766'));
      expect(await CBLK.totalSupply()).to.equal('0');
      expect(await CBT1.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT2.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT3.balanceOf(CBLK.address)).to.equal(
        ethers.utils.parseEther('0')
      );
      expect(await CBT1.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBT2.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      expect(await CBT3.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('1000')
      );
      await expect(CBLK.climateBackedTonnes(0)).to.be.reverted;
    });
  });
});

// npx hardhat test
