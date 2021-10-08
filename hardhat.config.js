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
     },
     corrently: {
       url: "http://rathgeb.corrently.de:8545",
       chainId: 6226
     }
   }
};
