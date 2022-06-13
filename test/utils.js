// Mint an amount of each of tokens to owner then grant approval for them to a spender
exports.mintAndApprove = async (tokens, amounts, owner, spender) => {
  for (let i = 0; i < tokens.length; i++) {
    await tokens[i].mint(owner.address, amounts[i]);
    await tokens[i].approve(spender.address, amounts[i]);
  }
};
