networkConfig = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0x1cF3Aa9DBF4880d797945726B94B9d29164211BE",
  },
}

const developmentChain = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000

module.exports = {
  networkConfig,
  developmentChain,
  DECIMALS,
  INITIAL_ANSWER,
}
