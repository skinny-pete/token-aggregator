const { ethers } = require("hardhat");

async function main() {
  const me = "0x56CB68BbF27E8e6cb85D8b454a3e4Fb5FaE2588f";

  const UnfixedFactoryFactory = await ethers.getContractFactory("CBLKUnfixedFactory")
  const FixedFactoryFactory = await ethers.getContractFactory("CBLKFixedFactory")

  const CBLKIndexFactory = await ethers.getContractFactory("CBLKIndex")

  const UnfixedFactory = await UnfixedFactoryFactory.deploy()
  const FixedFactory = await FixedFactoryFactory.deploy()

  const CBLKIndex = await CBLKIndexFactory.deploy(FixedFactory.address, UnfixedFactory.address)
  await UnfixedFactory.setIndex(CBLKIndex.address)
  await FixedFactory.setIndex(CBLKIndex.address)
  


  console.log("Unfixed: ", UnfixedFactory.address);
  console.log("Fixed: ", FixedFactory.address);
  console.log("index: ", CBLKIndex.address);
  await UnfixedFactory.approve(me, true);
  await FixedFactory.approve(me, true);
  console.log("Approved: ", me);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
