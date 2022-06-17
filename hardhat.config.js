require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")

require("hardhat-deploy")

module.exports = {
  // solidity: "0.8.8",
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: process.env.GOERLI_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    // currency: "USD",
    // coinmarketcap se api fetch to get USD values,
    // coinmarketcap: ...
    // token: "MATIC"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
}
