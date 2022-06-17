const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe Staging Tests", async function () {
      let deployer
      let fundMe
      const sendValue = ethers.utils.parseEther("100")
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        )
        assert.equal(endingFundMeBalance.toString(), "0")
      })
    })
