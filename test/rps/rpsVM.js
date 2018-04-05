// Copyright (C) 2018 TrueBit
// See Copyright Notice in LICENSE-MIT.txt

const RpsVM = artifacts.require("./repeatedgame/rps/RpsVM.sol")
const web3 = require('web3')

contract('RpsVM', function(accounts) {
  let rpsVM

  let actions = [
    // Player 1: Rock (0b00), Player 2: Scissors (0b10)
    "0x0000000000000000000000000000000000000000000000000000000000000008",
  ];

  let emptyState = "0x0000000000000000000000000000000000000000000000000000000000000000";

  let emptyMerkle = "0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563";

  let firstState = "0x0000000000000000000000000000000000000000000000000000000000000001";

  let firstMerkle = "0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6";

  before(async () => {
    rpsVM = await RpsVM.deployed();
  });

  it("should merklize empty state", async () => {
    assert.equal(
      emptyMerkle,
      await rpsVM.merklizeState.call(emptyState)
    );
  });

  it("should merklize first state", async () => {
    assert.equal(
      firstMerkle,
      await rpsVM.merklizeState.call(firstState)
    );
  });

  it("should run a step", async () => {
    assert.deepEqual(
      await rpsVM.runStep.call(emptyState, actions[0]),
      firstState
    );
  });

  it("should return initial step", async () => {
    assert.deepEqual(
      await rpsVM.runSteps.call(actions, 0),
      [
        emptyState,
        emptyMerkle,
      ]
    )
  })

  it("should run steps", async () => {
    assert.deepEqual(
      await rpsVM.runSteps.call(actions, actions.length),
      [
        firstState,
        firstMerkle,
      ]
    );
  });
});
