// ------------------- CHANGEBLOCK CBT-CBLK UTILS -------------------

// Mint and approve an amount of ERC20 tokens
const mintAndApproveERC20 = async (ERC20, amount, approver, approved) => {
  return ERC20.mint(approver.address, amount).then(() => {
    ERC20.connect(approver).approve(approved.address, amount);
  });
};

const setupCBLKFixed = async (factory, CBTs, ratios, amounts, depositor) => {
  const CBLKFixed = await factory.deploy(
    'Fixed Ratio Changeblock 1',
    'CBLK-F-1',
    CBTs.map((x) => x.address),
    ratios
  );
  for (let i = 0; i < CBTs.length; i++) {
    await CBTs[i].mint(depositor.address, amounts[i]);
    await CBTs[i].connect(depositor).approve(CBLKFixed.address, amounts[i]);
  }
  await CBLKFixed.deposit(amounts);
  return CBLKFixed;
};

module.exports = {
  mintAndApproveERC20,
  setupCBLKFixed,
};
