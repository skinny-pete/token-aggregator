// const { expect } = require('chai');
// const { ethers } = require('hardhat');

// const { mintAndApprove } = require('./utils');

// describe('CBLKUnfixed', () => {
//   let CBLKUnfixedFactory, CBTFactory; // Contract factories
//   let CBLKUnfixed, CBT1, CBT2, CBT3; // Contract instances
//   let deployer, notDeployer; // Signers

//   before(async () => {
//     [deployer, notDeployer] = await ethers.getSigners();
//     CBTFactory = await ethers.getContractFactory('CBT');
//     CBLKUnfixedFactory = await ethers.getContractFactory('CBLKUnfixed');
//   });

//   beforeEach(async () => {
//     // Setup CBLKUnfixed with 1000 of each CBT
//     CBLKUnfixed = await CBLKUnfixedFactory.deploy('Changeblock', 'CBLKF-1');
//     CBT1 = await CBTFactory.deploy('Carbon Base Tonne: 1', 'CBT1');
//     CBT2 = await CBTFactory.deploy('Carbon Base Tonne: 2', 'CBT2');
//     CBT3 = await CBTFactory.deploy('Carbon Base Tonne: 3', 'CBT3');
//     await mintAndApprove(
//       [CBT1, CBT2, CBT3],
//       [
//         ethers.utils.parseEther('1000'),
//         ethers.utils.parseEther('1000'),
//         ethers.utils.parseEther('1000'),
//       ],
//       deployer,
//       CBLKUnfixed
//     );
//     await CBLKUnfixed.rebalance(
//       [CBT1.address, CBT2.address, CBT3.address],
//       [
//         ethers.utils.parseEther('1000'),
//         ethers.utils.parseEther('1000'),
//         ethers.utils.parseEther('1000'),
//       ],
//       [],
//       []
//     );
//   });

//   describe('Rebalance', async () => {
//     it('Correct state post inital CBT deposit', async () => {
//       expect(await CBT1.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('1000'));
//       expect(await CBT2.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('1000'));
//       expect(await CBT3.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('1000'));
//       expect(await CBLKUnfixed.balanceOf(deployer.address)).to.equal(
//         ethers.utils.parseEther('3000')
//       );
//       expect(await CBT1.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT2.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT3.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBLKUnfixed.climateBackedTonnes(0)).to.equal(CBT1.address);
//       expect(await CBLKUnfixed.climateBackedTonnes(1)).to.equal(CBT2.address);
//       expect(await CBLKUnfixed.climateBackedTonnes(2)).to.equal(CBT3.address);
//     });

//     it('Emits `Rebalance` event ', async () => {
//       await mintAndApprove([CBT2], [ethers.utils.parseEther('250')], deployer, CBLKUnfixed);
//       await expect(
//         CBLKUnfixed.rebalance(
//           [CBT2.address],
//           [ethers.utils.parseEther('250')],
//           [CBT1.address, CBT3.address],
//           [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
//         )
//       )
//         .to.emit(CBLKUnfixed, 'Rebalance')
//         .withArgs(
//           [CBT2.address],
//           [ethers.utils.parseEther('250')],
//           [CBT1.address, CBT3.address],
//           [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
//         );
//     });

//     it('Rebalance with equal input and output', async () => {
//       await mintAndApprove([CBT2], [ethers.utils.parseEther('100')], deployer, CBLKUnfixed);
//       await CBLKUnfixed.rebalance(
//         [CBT2.address],
//         [ethers.utils.parseEther('100')],
//         [CBT1.address, CBT3.address],
//         [ethers.utils.parseEther('50'), ethers.utils.parseEther('50')]
//       );
//       expect(await CBT1.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('950'));
//       expect(await CBT2.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('1100'));
//       expect(await CBT3.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('950'));
//       expect(await CBLKUnfixed.balanceOf(deployer.address)).to.equal(
//         ethers.utils.parseEther('3000')
//       );
//       expect(await CBT1.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('50'));
//       expect(await CBT2.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT3.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('50'));
//     });

//     it('Requires CBLKUnfixed burn when output > input', async () => {
//       await mintAndApprove([CBT2], [ethers.utils.parseEther('100')], deployer, CBLKUnfixed);
//       await CBLKUnfixed.rebalance(
//         [CBT2.address],
//         [ethers.utils.parseEther('100')],
//         [CBT1.address, CBT3.address],
//         [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
//       );
//       expect(await CBT1.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('900'));
//       expect(await CBT2.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('1100'));
//       expect(await CBT3.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('900'));
//       expect(await CBLKUnfixed.balanceOf(deployer.address)).to.equal(
//         ethers.utils.parseEther('2900')
//       );
//       expect(await CBT1.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('100'));
//       expect(await CBT2.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT3.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('100'));
//     });

//     it('Mints CBLKUnfixed when input > output', async () => {
//       await mintAndApprove([CBT2], [ethers.utils.parseEther('500')], deployer, CBLKUnfixed);
//       await CBLKUnfixed.rebalance(
//         [CBT2.address],
//         [ethers.utils.parseEther('500')],
//         [CBT1.address, CBT3.address],
//         [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
//       );
//       expect(await CBT1.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('900'));
//       expect(await CBT2.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('1500'));
//       expect(await CBT3.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('900'));
//       expect(await CBLKUnfixed.balanceOf(deployer.address)).to.equal(
//         ethers.utils.parseEther('3300')
//       );
//       expect(await CBT1.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('100'));
//       expect(await CBT2.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT3.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('100'));
//     });

//     it('Requires sufficient CBT approval ', async () => {
//       await expect(
//         CBLKUnfixed.rebalance(
//           [CBT2.address],
//           [ethers.utils.parseEther('500')],
//           [CBT1.address, CBT3.address],
//           [ethers.utils.parseEther('100'), ethers.utils.parseEther('100')]
//         )
//       ).to.be.reverted;
//     });

//     it('Introduction of new token', async () => {
//       const CBT4 = await CBTFactory.deploy('Carbon Base Tonne: 4', 'CBT4');
//       await mintAndApprove([CBT4], [ethers.utils.parseEther('1000')], deployer, CBLKUnfixed);
//       await CBLKUnfixed.rebalance([CBT4.address], [ethers.utils.parseEther('1000')], [], []);
//       expect(await CBT4.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('1000'));
//       expect(await CBLKUnfixed.climateBackedTonnes(3)).to.equal(CBT4.address);
//     });

//     it('De-registers token on removal', async () => {
//       await CBLKUnfixed.rebalance([], [], [CBT1.address], [ethers.utils.parseEther('1000')]);
//       expect(await CBLKUnfixed.climateBackedTonnes(0)).to.equal(CBT3.address);
//       expect(await CBLKUnfixed.climateBackedTonnes(1)).to.equal(CBT2.address);
//       await expect(CBLKUnfixed.climateBackedTonnes(2)).to.be.reverted;
//     });
//   });

//   describe('Withdraw', () => {
//     it('Complete withdrawal', async () => {
//       await expect(CBLKUnfixed.withdraw(ethers.utils.parseEther('3000')));
//       expect(await CBT1.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT2.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT3.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBLKUnfixed.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT1.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('1000'));
//       expect(await CBT2.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('1000'));
//       expect(await CBT3.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('1000'));
//       await expect(CBLKUnfixed.climateBackedTonnes(0)).to.be.reverted;
//     });

//     // Check dust amounts are as understood
//     it('Partial withdrawal', async () => {
//       await CBLKUnfixed.withdraw(ethers.utils.parseEther('1250'));
//       expect(await CBT1.balanceOf(deployer.address)).to.equal(
//         ethers.utils.parseEther('1250').mul('1000').div('3000')
//       );
//       expect(await CBT2.balanceOf(deployer.address)).to.equal(
//         ethers.utils.parseEther('1250').mul('1000').div('3000')
//       );
//       expect(await CBT3.balanceOf(deployer.address)).to.equal(
//         ethers.utils.parseEther('1250').mul('1000').div('3000')
//       );
//       expect(await CBLKUnfixed.balanceOf(deployer.address)).to.equal(
//         ethers.utils.parseEther('1750')
//       );
//       expect(await CBLKUnfixed.totalSupply()).to.equal(ethers.utils.parseEther('1750'));
//     });
//     it('Emits `Withdrawal` event ', async () => {
//       await expect(CBLKUnfixed.withdraw(ethers.utils.parseEther('1000')))
//         .to.emit(CBLKUnfixed, 'Withdrawal')
//         .withArgs(deployer.address, [
//           ethers.utils.parseEther('1000').mul('1000').div('3000'),
//           ethers.utils.parseEther('1000').mul('1000').div('3000'),
//           ethers.utils.parseEther('1000').mul('1000').div('3000'),
//         ]);
//     });

//     it('Rejects withdrawal with insufficient CBLK', async () => {
//       await expect(
//         CBLKUnfixed.connect(notDeployer).withdraw(ethers.utils.parseEther('1000'))
//       ).to.be.revertedWith('ERC20: burn amount exceeds balance');
//       await expect(CBLKUnfixed.withdraw(ethers.utils.parseEther('4000'))).to.be.revertedWith(
//         'ERC20: burn amount exceeds balance'
//       );
//     });

//     it('De-registers tokens on removal', async () => {
//       await CBLKUnfixed.withdraw(ethers.utils.parseEther('3000'));
//       await expect(CBLKUnfixed.climateBackedTonnes(0)).to.be.reverted;
//     });

//     it('Dust is collected by last withdrawer', async () => {
//       await CBLKUnfixed.withdraw(ethers.utils.parseEther('1234'));
//       await CBLKUnfixed.withdraw(ethers.utils.parseEther('1766'));
//       expect(await CBLKUnfixed.totalSupply()).to.equal('0');
//       expect(await CBT1.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT2.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT3.balanceOf(CBLKUnfixed.address)).to.equal(ethers.utils.parseEther('0'));
//       expect(await CBT1.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('1000'));
//       expect(await CBT2.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('1000'));
//       expect(await CBT3.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther('1000'));
//       await expect(CBLKUnfixed.climateBackedTonnes(0)).to.be.reverted;
//     });
//   });
// });
