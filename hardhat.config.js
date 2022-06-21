require("@nomiclabs/hardhat-waffle");
require('hardhat-contract-sizer');

module.exports = {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 100,
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      url: "https://speedy-nodes-nyc.moralis.io/614505f786fface05285bafb/polygon/mumbai",
      accounts: [
        "c22876839be9bb295ca99f427c53dc76c1f960a4f7e428a5e4d2ed7c62feb204",
      ],
    },
  },
};
