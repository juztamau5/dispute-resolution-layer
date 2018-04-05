// Copyright (C) 2018 TrueBit
// See Copyright Notice in LICENSE-MIT.txt

const RpsAction = artifacts.require("./repeatedgame/rps/RpsAction.sol")
const RpsState = artifacts.require("./repeatedgame/rps/RpsState.sol")
const RpsVM = artifacts.require("./repeatedgame/rps/RpsVM.sol")
const RepeatedGameVerificationGame = artifacts.require("./repeatedgame/RepeatedGameVerificationGame.sol")

module.exports = function(deployer) {
  deployer.deploy(RpsAction)
  deployer.deploy(RpsState)

  deployer.link(RpsAction, RpsVM)
  deployer.link(RpsState, RpsVM)
  deployer.deploy(RpsVM)

  deployer.link(RpsAction, RepeatedGameVerificationGame)
  deployer.link(RpsState, RepeatedGameVerificationGame)
  deployer.deploy(RepeatedGameVerificationGame)
}
