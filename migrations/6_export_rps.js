// Copyright (C) 2018 TrueBit
// See Copyright Notice in LICENSE-MIT.txt

const RpsVM = artifacts.require("./repeatedgame/rps/RpsVM.sol")
const RepeatedGameVerificationGame = artifacts.require("./repeatedgame/RepeatedGameVerificationGame.sol")

const fs = require('fs')

module.exports = (deployer, network) => {
  let exportedContracts = {}

  let contracts = [RpsVM, RepeatedGameVerificationGame]

  contracts.forEach((contract) => {

    exportedContracts[contract.contractName] = {
      abi: contract.abi,
      address: contract.address
    }
  })

  if (!fs.existsSync(__dirname + "/../export/")){
    fs.mkdirSync(__dirname + "/../export/")
  }

  let path = __dirname + "/../export/" + network + "_rps.json"

  fs.writeFile(path, JSON.stringify(exportedContracts), (e) => {if(e) console.error(e) })
}
