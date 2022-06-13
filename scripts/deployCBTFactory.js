const { ethers } = require("hardhat");

async function main() {
  const me = "0x56CB68BbF27E8e6cb85D8b454a3e4Fb5FaE2588f";

  const Factory = await ethers.getContractFactory("CBTFactory");
  const factory = await Factory.deploy();

  await factory.deployed();

  console.log("Factory deployed to:", factory.address);
  await factory.approve(me, true);
  console.log("Approved: ", me);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
