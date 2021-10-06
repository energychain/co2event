
const chai = require('chai');
const waffle = require('ethereum-waffle');
const ethers = require("hardhat");
const CO2Accounting = require('../build/CO2Accounting.json');

chai.use(waffle.solidity);

describe('CO2Accounting', () => {
  const [walletGodFather, walletEmitter,walletEntity,walletCompensator] = new waffle.MockProvider().getWallets();
  let contract =  ethers.Contract;

  beforeEach(async () => {
    contract = await waffle.deployContract(walletGodFather, CO2Accounting, []);
  });

  it('Roles Assignment and Test', async () => {
    // We validate that role assignment works as designed.
    const EMITTER_ROLE = await contract.EMITTER_ROLE();
    const COMPENSATOR_ROLE = await contract.COMPENSATOR_ROLE();

    // Check that Emitter Wallet does not have Emitter Role
    await chai.expect(await contract.hasRole(EMITTER_ROLE,walletEmitter.address)).to.equal(false);
    await chai.expect(await contract.hasRole(COMPENSATOR_ROLE,walletCompensator.address)).to.equal(false);

    // Run Transaction to assign Emitter Role to Emitter Wallet
    await contract.grantRole(EMITTER_ROLE,walletEmitter.address);
    await contract.grantRole(COMPENSATOR_ROLE,walletCompensator.address);

    // Check that Emitter Wallet does have Emitter Role after Transaction
    await chai.expect(await contract.hasRole(EMITTER_ROLE,walletEmitter.address)).to.equal(true);
    await chai.expect(await contract.hasRole(COMPENSATOR_ROLE,walletCompensator.address)).to.equal(true);

    // Check that Emitter Wallet does not have Compensator Role.
    await chai.expect(await contract.hasRole(COMPENSATOR_ROLE,walletEmitter.address)).to.equal(false);
    await chai.expect(await contract.hasRole(EMITTER_ROLE,walletCompensator.address)).to.equal(false);

    // Check that Entity Wallet does not have any of our Roles (eq. no Priviliges)
    await chai.expect(await contract.hasRole(COMPENSATOR_ROLE,walletEntity.address)).to.equal(false);
    await chai.expect(await contract.hasRole(EMITTER_ROLE,walletEntity.address)).to.equal(false);
  });
  it('Step 1 - A Charging Session by User ended - Emitter tells 32g CO2 and emits it to user', async () => {
    // Check All Balances are 0
    await chai.expect(await contract.balanceOf(walletEmitter.address)).to.equal(0);
    await chai.expect(await contract.balanceOf(walletEntity.address)).to.equal(0);
    await chai.expect(await contract.balanceOf(walletCompensator.address)).to.equal(0);

    // Run Emission Event transaction
    // await contract.grantRole(EMITTER_ROLE,walletEmitter.address);
    // await contract.grantRole(COMPENSATOR_ROLE,walletCompensator.address);
  });

});
