var CO2Accounting = artifacts.require("./CO2Accounting.sol");

module.exports = function(deployer) {
  deployer.deploy(CO2Accounting);
};
