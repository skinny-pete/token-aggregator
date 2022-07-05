const { ethers } = require("hardhat");

async function main() {
    const me = "0x56CB68BbF27E8e6cb85D8b454a3e4Fb5FaE2588f";

    const UnfixedFactoryFactory = await ethers.getContractFactory("CBLKUnfixedFactory")

    const UnfixedFactory = await UnfixedFactoryFactory.deploy()

    const CBLKAddress = await UnfixedFactory.callStatic.deploy("CBLKTest", "CBLK")
    await UnfixedFactory.deploy("CBLKTest", "CBLK")

    console.log("new CBLK: ", CBLKAddress)

    const signer = await ethers.getSigner()

    const abi = ["function rebalance(address[] inputTokens, uint[] inputAmount, address[] outputTokens, uint[] outputAmounts) public"]
    const CBLK = await ethers.getContractAt("CBLKUnfixed", CBLKAddress, signer)

    const CBTFactory = await ethers.getContractFactory("CBT")

    let CBT1 = await CBTFactory.deploy("CBT1", "CBT1")
    let CBT2 = await CBTFactory.deploy("CBT2", "CBT2")
    let CBT3 = await CBTFactory.deploy("CBT3", "CBT3")

    let amount = ethers.utils.parseEther("1000")
    await CBT1.mint(signer.address, amount)
    await CBT2.mint(signer.address, amount)
    await CBT3.mint(signer.address, amount)

    await CBT1.approve(CBLK.address, amount)
    await CBT2.approve(CBLK.address, amount)
    await CBT3.approve(CBLK.address, amount)

    tokens = [CBT1.address, CBT2.address, CBT3.address]
    inAmounts = [amount,amount,amount]

    console.log("CBLK Balance Before: ", await CBLK.balanceOf(signer.address))

    await CBLK.rebalance(tokens, inAmounts, [], [])

    console.log("CBLK Balance After: ", await CBLK.balanceOf(signer.address))



    // console.log("ADD: ", await CBLK.climateBackedTonnes(1))

}



main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
