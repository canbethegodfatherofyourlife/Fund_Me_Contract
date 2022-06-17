const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.utils.parseEther("100") // 1 ETH
      beforeEach(async function () {
        // deploy our fundMe contract
        // using Hardhat-deploy
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all")
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async function () {
        it("Sets the aggregator addresses correctly", async function () {
          const response = await fundMe.s_priceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          )
        })
        it("updates the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.s_addressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array to array of s_funders", async function () {
          await fundMe.fund({ value: sendValue })
          const funder = await fundMe.s_funders(0)
          assert.equal(funder, deployer)
        })
      })

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue })
        })

        it("Withdraw ETH from a single founder", async function () {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act
          const transaction = await fundMe.withdraw()
          const transactionReceipt = await transaction.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("Allows us to withdraw with multiple s_funders", async function () {
          // Arrange
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act
          const transaction = await fundMe.withdraw()
          const transactionReceipt = await transaction.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance),
            endingDeployerBalance.add(gasCost).toString()
          )

          // Make sure that the s_funders are reset properly
          await expect(fundMe.s_funders(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.s_addressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("Only allows the owner to withdraw", async () => {
          const accounts = ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await fundMe.connect(attacker)
          await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })

        it("Cheaper Withdraw Testing....", async function () {
          // Arrange
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act
          const transaction = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transaction.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance),
            endingDeployerBalance.add(gasCost).toString()
          )

          // Make sure that the s_funders are reset properly
          await expect(fundMe.s_funders(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.s_addressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("Only allows the owner to withdraw", async () => {
          const accounts = ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await fundMe.connect(attacker)
          await expect(attackerConnectedContract.cheaperWithdraw()).to.be
            .reverted
        })
      })
    })
