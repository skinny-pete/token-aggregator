const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CBLK', () => {
  let CBLKFactory, CBTFactory; // Contract factories
  let CBLK, CBTs; // Contract instances
  let deployer, notDeployer; // Signers
  let CBTAddresses; // Convenince values

  before(async () => {
    CBLKFactory = await ethers.getContractFactory('CBLK');
    CBTFactory = await ethers.getContractFactory('CBT');
    [deployer, notDeployer] = await ethers.getSigners();
  });

  beforeEach(async () => {
    CBLK = await CBLKFactory.deploy('Changeblock', 'CBLK');
    CBTs = [
      await CBTFactory.deploy('Carbon Base Tonne: 1', 'CBT-1'),
      await CBTFactory.deploy('Carbon Base Tonne: 2', 'CBT-2'),
      await CBTFactory.deploy('Carbon Base Tonne: 3', 'CBT-3'),
    ];
    CBTAddresses = CBTs.map((CBT) => CBT.address);
  });

  // Mint to deployer and approve to a recipient
  const mintAndApprove = async (tokens, amounts, owner, spender) => {
    for (let i = 0; i < tokens.length; i++) {
      await tokens[i].mint(owner.address, amounts[i]);
      await tokens[i].approve(spender.address, amounts[i]);
    }
  };

  describe('Deposits', async () => {
    const CBTDeposits = ['100', '200', '300'].map((n) =>
      ethers.utils.parseEther(n)
    );

    it('Correct post-deposit token balances', async () => {
      await mintAndApprove(CBTs, CBTDeposits, deployer, CBLK);
      await CBLK.deposit(CBTAddresses, CBTDeposits);
      await expect(await CBLK.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther('600')
      );
      for (let i = 0; i < CBTs.length; i++) {
        await expect(await CBTs[i].balanceOf(CBLK.address)).to.equal(
          CBTDeposits[i]
        );
      }
    });

    it('Emits `Deposit` event', async () => {
      await mintAndApprove(CBTs, CBTDeposits, deployer, CBLK);
      await expect(CBLK.deposit(CBTAddresses, CBTDeposits))
        .to.emit(CBLK, 'Deposit')
        .withArgs(CBTAddresses, CBTDeposits);
    });

    it('Rejects non-owner deposits', async () => {
      await mintAndApprove(CBTs, CBTDeposits, notDeployer, CBLK);
      await expect(
        CBLK.connect(notDeployer).deposit(CBTAddresses, CBTDeposits)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Rejects deposits with insufficient approved CBTs', async () => {
      await mintAndApprove(CBTs, CBTDeposits, deployer, CBLK);
      const increasedCBTDeposits = CBTDeposits.map((amount) => amount.mul('2'));
      await expect(
        CBLK.deposit(CBTAddresses, increasedCBTDeposits)
      ).to.be.revertedWith('ERC20: insufficient allowance');
    });
  });
});

// We want proof it functions as it's supposed to,
// so allows assembly and disassembly and check it's the right number minted and burned and returned
// Check that any whitelisting or anything like that works
// Check total supply is updated etc
