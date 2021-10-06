/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.7",
  defaultNetwork: "hardhat",
   networks: {
     hardhat: {
       gas: 2100000,
       gasPrice: 8000000000
     }
   }
};
