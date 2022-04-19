const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CBLK", function () {
  let CBLK, CBLKFactory, CBT, CBTFactory, deployer, acc1;
  let CBTS, ratios;

  before(async () => {
    CBLKFactory = await ethers.getContractFactory("CBLK");
    CBTFactory = await ethers.getContractFactory("CBT");
  });

  beforeEach(async () => {
    [deployer, acc1] = await ethers.getSigners();
    CBT1 = await CBTFactory.deploy("Changeblock Base Tonne", "CBT");
    CBT2 = await CBTFactory.deploy("Changeblock Base Tonne", "CBT");
    CBT3 = await CBTFactory.deploy("Changeblock Base Tonne", "CBT");
    CBT4 = await CBTFactory.deploy("Changeblock Base Tonne", "CBT");
    const cbtAddresses = [
      CBT1.address,
      CBT2.address,
      CBT3.address,
      CBT4.address,
    ];
    CBTS = [CBT1, CBT2, CBT3, CBT4];
    ratios = ["0.2", "0.2", "0.5", "0.1"].map((x) =>
      ethers.utils.parseEther(x)
    );
    CBLK = await CBLKFactory.deploy(
      "Changeblock",
      "CBLK",
      cbtAddresses,
      ratios
    );
  });

  async function mintAndApprove(_ratios = null) {
    if (_ratios == null) {
      _ratios = ratios;
    }
    for (let i = 0; i < CBTS.length; i++) {
      const CBT = CBTS[i];
      await CBT.mint(deployer.address, _ratios[i]);
      await CBT.approve(CBLK.address, _ratios[i]);
    }
  }

  it("Should deploy without errors", async () => {});

  it("Should allow deposits at correct ratio", async () => {
    await mintAndApprove();
    await expect(() => CBLK.deposit(ratios)).to.changeTokenBalance(
      CBLK,
      deployer,
      ethers.utils.parseEther("1")
    );
  });

  it("Should revert with deposit in incorrect ratio", async () => {
    incorrectAmounts = ["0.3", "0.3", "0.15", "0.25"].map((x) =>
      ethers.utils.parseEther(x)
    );
    await mintAndApprove((_ratios = incorrectAmounts));

    await expect(CBLK.deposit(incorrectAmounts)).to.be.revertedWith(
      "Incorrect deposit ratio"
    );
  });

  it("Should allow withdrawals", async () => {
    amounts = ["20", "20", "50", "10"].map((x) => ethers.utils.parseEther(x));
    await mintAndApprove(amounts);

    await CBLK.deposit(amounts);
    expect(await CBLK.balanceOf(deployer.address)).to.equal(
      ethers.utils.parseEther("100")
    );

    await CBLK.withdraw(ethers.utils.parseEther("50"));
    expect(await CBT1.balanceOf(deployer.address)).to.equal(
      ethers.utils.parseEther("10")
    );
    expect(await CBT2.balanceOf(deployer.address)).to.equal(
      ethers.utils.parseEther("10")
    );
    expect(await CBT3.balanceOf(deployer.address)).to.equal(
      ethers.utils.parseEther("25")
    );
    expect(await CBT4.balanceOf(deployer.address)).to.equal(
      ethers.utils.parseEther("5")
    );
    expect(await CBLK.balanceOf(deployer.address)).to.equal(
      ethers.utils.parseEther("50")
    );
  });

  it("Should only allow owner to mint CBTs", async () => {
    await expect(() =>
      CBT1.connect(deployer).mint(
        deployer.address,
        ethers.utils.parseEther("100")
      )
    ).to.changeTokenBalance(CBT1, deployer, ethers.utils.parseEther("100"));
    await expect(
      CBT1.connect(acc1).mint(acc1.address, ethers.utils.parseEther("100"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
