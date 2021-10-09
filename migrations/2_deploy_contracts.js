var CO2Accounting = artifacts.require("./CO2Accounting.sol");

module.exports = async function(deployer,network, accounts) {
  await deployer.deploy(CO2Accounting);
  const instance = await CO2Accounting.deployed();

  await instance.grantRole(await instance.DEFAULT_ADMIN_ROLE(),'0xD0FB2327EC99AF3F7b2762D75DD6d4790Cfaca74');
  await instance.grantRole(await instance.EMITTER_ROLE(),'0xd5Fe0C262cE3EEd5B2D3Be43ff4A0487f740114F');
  await instance.grantRole(await instance.COMPENSATOR_ROLE(),'0x6A85b9f1df53037B0824A2B957787fBBAf814Ac0');

  // Preload Mock Accounts with some Ether for Gas
  await web3.eth.sendTransaction({from:accounts[0],to:'0xD0FB2327EC99AF3F7b2762D75DD6d4790Cfaca74',value:300000000000000000});
  await web3.eth.sendTransaction({from:accounts[0],to:'0xd5Fe0C262cE3EEd5B2D3Be43ff4A0487f740114F',value:300000000000000000});
  await web3.eth.sendTransaction({from:accounts[0],to:'0x6A85b9f1df53037B0824A2B957787fBBAf814Ac0',value:300000000000000000});
};
