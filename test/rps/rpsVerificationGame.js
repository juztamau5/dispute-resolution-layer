// Copyright (C) 2018 TrueBit
// See Copyright Notice in LICENSE-MIT.txt

const RepeatedGameVerificationGame = artifacts.require("./repeatedgame/RepeatedGameVerificationGame.sol")
const RpsVM = artifacts.require("./repeatedgame/rps/RpsVM.sol")
const web3 = require('web3')
const merkleTree = require('../helpers/merkleTree')
const sha3 = require('ethereumjs-util').sha3

const toResult = (data) => {
  return {
    state: data[0],
    stateHash: data[1]
  }
}

contract('RepeatedGameVerificationGame', function(accounts) {
  // Deployments
  let repeatedGameVerificationGame;
  let rpsVM;
  let checkProofOrderedSolidity;

  // Games
  let gameId1;
  let gameIdNBegin;
  let gameIdNEnd;

  // Actions
  let actions1 = [
    // Player 1: Rock (0b00), Player 2: Scissors (0b10)
    "0x0000000000000000000000000000000000000000000000000000000000000008",
  ];

  let actionsN = [
    // Player 1: Rock (0b00), Player 2: Scissors (0b10)
    "0x0000000000000000000000000000000000000000000000000000000000000008",
    // Player 1: Rock (0b00), Player 2: Paper (0b01)
    "0x0000000000000000000000000000000000000000000000000000000000000004",
    // Player 1: Paper (0b01), Player 2: Rock (0b00)
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    // Player 1: Paper (0b01), Player 2: Scissors (0b10)
    "0x0000000000000000000000000000000000000000000000000000000000000009",
    // Player 1: Scissors (0b10), Player 2: Paper (0b01)
    "0x0000000000000000000000000000000000000000000000000000000000000006",
    // Player 1: Scissors (0b10), Player 2: Rock (0b00)
    "0x0000000000000000000000000000000000000000000000000000000000000002",
    // Player 1: Rock (0b00), Player 2: Scissors (0b10)
    "0x0000000000000000000000000000000000000000000000000000000000000008"
  ];

  // Query steps
  step1 = actions1.length
  stepNBegin = 1
  stepNEnd = actionsN.length

  // Merkle trees
  let mtree1;
  let mtreeN;
  let hashes1 = actions1.map(e => sha3(e));
  let hashesN = actionsN.map(e => sha3(e));
  let root1;
  let rootN;

  // Parameters
  const responseTime = 20;

  before(async () => {
    // Initialize deployments
    repeatedGameVerificationGame = await RepeatedGameVerificationGame.deployed();
    rpsVM = await RpsVM.deployed();
    checkProofOrderedSolidity = merkleTree.checkProofOrderedSolidityFactory(repeatedGameVerificationGame.checkProofOrdered);

    // Initialize Merkle trees
    mtree1 = new merkleTree.MerkleTree(hashes1, true); // Set flag to true to be ordered
    mtreeN = new merkleTree.MerkleTree(hashesN, true);
    root1 = mtree1.getRoot();
    rootN = mtreeN.getRoot();
  });

  it("should challenge and initialize (1)", async () => {
    let actions = actions1
    let root = root1

    // Calculate final hash
    let finalStateHash = toResult(await rpsVM.runSteps.call(actions, actions.length)).stateHash;

    let tx = await repeatedGameVerificationGame.commitChallenge(
      accounts[1],
      accounts[2],
      web3.utils.soliditySha3("spec usually goes here"),
      {from: accounts[2]}
    );

    let log = tx.logs[0];

    gameId = log.args.gameId;

    await repeatedGameVerificationGame.initGame(
      gameId,
      RpsVM.address,
      merkleTree.bufToHex(root),
      responseTime,
      finalStateHash,
      actions.length
    );

    // Record game ID
    gameId1 = gameId
  });

  it("should challenge and initialize (N-begin)", async () => {
    let actions = actionsN
    let root = rootN

    // Calculate final hash
    let finalStateHash = toResult(await rpsVM.runSteps.call(actions, actions.length)).stateHash;

    let tx = await repeatedGameVerificationGame.commitChallenge(
      accounts[1],
      accounts[2],
      web3.utils.soliditySha3("spec usually goes here"),
      {from: accounts[2]}
    );

    let log = tx.logs[0];

    gameId = log.args.gameId;

    await repeatedGameVerificationGame.initGame(
      gameId,
      RpsVM.address,
      merkleTree.bufToHex(root),
      responseTime,
      finalStateHash,
      actions.length
    );

    // Record game ID
    gameIdNBegin = gameId
  });

  it("should challenge and initialize (N-end)", async () => {
    let actions = actionsN
    let root = rootN

    // Calculate final hash
    let finalStateHash = toResult(await rpsVM.runSteps.call(actions, actions.length)).stateHash;

    let tx = await repeatedGameVerificationGame.commitChallenge(
      accounts[1],
      accounts[2],
      web3.utils.soliditySha3("spec usually goes here"),
      {from: accounts[2]}
    );

    let log = tx.logs[0];

    gameId = log.args.gameId;

    await repeatedGameVerificationGame.initGame(
      gameId,
      RpsVM.address,
      merkleTree.bufToHex(root),
      responseTime,
      finalStateHash,
      actions.length
    );

    // Record game ID
    gameIdNEnd = gameId
  });

  it("should query step (N-begin)", async () => {
    let gameId = gameIdNBegin
    let step = stepNBegin

    let tx = await repeatedGameVerificationGame.query(gameId, step, {from: accounts[2]});

    let query = tx.logs[0].args;
    assert.equal(query.stepNumber.toNumber(), step);
    assert.equal(query.gameId, gameId);
  });

  it("should respond to query (N-begin)", async () => {
    let gameId = gameIdNBegin
    let actions = actionsN
    let step = stepNBegin

    let result = toResult(await rpsVM.runSteps.call(actions, step));

    let tx = await repeatedGameVerificationGame.respond(gameId, step, result.stateHash, {from: accounts[1]});

    let response = tx.logs[0].args;
    assert.equal(response.hash, result.stateHash);
    assert.equal(response.gameId, gameId);
  });

  it("should query next step down (N-begin)", async () => {
    let gameId = gameIdNBegin
    let step = stepNBegin

    let tx = await repeatedGameVerificationGame.query(gameId, step - 1, {from: accounts[2]});

    let query = tx.logs[0].args;
    assert.equal(query.stepNumber.toNumber(), step - 1);
    assert.equal(query.gameId, gameId);
  });

  it("should query next step down (N-end)", async () => {
    let gameId = gameIdNEnd
    let step = stepNEnd

    let tx = await repeatedGameVerificationGame.query(gameId, step - 1, {from: accounts[2]});

    let query = tx.logs[0].args;
    assert.equal(query.stepNumber.toNumber(), step - 1);
    assert.equal(query.gameId, gameId);
  });

  it("should respond to query (N-end)", async () => {
    let gameId = gameIdNEnd
    let actions = actionsN
    let step = stepNEnd

    let result = toResult(await rpsVM.runSteps.call(actions, step - 1));

    let tx = await repeatedGameVerificationGame.respond(gameId, step - 1, result.stateHash, {from: accounts[1]});

    let response = tx.logs[0].args;
    assert.equal(response.hash, result.stateHash);
    assert.equal(response.gameId, gameId);
  });

  it("should query step (N-end)", async () => {
    let gameId = gameIdNEnd
    let step = stepNEnd

    let tx = await repeatedGameVerificationGame.query(gameId, step, {from: accounts[2]});

    let query = tx.logs[0].args;
    assert.equal(query.stepNumber.toNumber(), step);
    assert.equal(query.gameId, gameId);
  });

  it("should perform step verification (1)", async () => {
    let gameId = gameId1
    let actions = actions1
    let mtree = mtree1
    let hashes = hashes1
    let root = root1
    let step = step1

    let lowStepState = toResult(await rpsVM.runSteps.call(actions, step - 1)).state;

    let highStep = step;
    let highStepIndex = step - 1;
    let highStepState = await rpsVM.runStep.call(lowStepState, actions[highStepIndex]);
    let highHash = await rpsVM.merklizeState.call(highStepState);

    let proof = mtree.getProofOrdered(hashes[highStepIndex], highStep);
    const newProof = '0x' + proof.map(e => e.toString('hex')).join('');

    assert(await checkProofOrderedSolidity(proof, root, hashes[highStepIndex], highStep));

    tx = await repeatedGameVerificationGame.performStepVerification(
      gameId,
      lowStepState,
      highHash,
      actions[highStepIndex],
      newProof,
      {from: accounts[1]}
    );

    assert.equal(3, (await repeatedGameVerificationGame.status.call(gameId)).toNumber());
  });

  it("should perform step verification (N-begin)", async () => {
    let gameId = gameIdNBegin
    let actions = actionsN
    let mtree = mtreeN
    let hashes = hashesN
    let root = rootN
    let step = stepNBegin

    let lowStepState = toResult(await rpsVM.runSteps.call(actions, step - 1)).state;

    let highStep = step;
    let highStepIndex = step - 1;
    let highStepState = await rpsVM.runStep.call(lowStepState, actions[highStepIndex]);
    let highHash = await rpsVM.merklizeState.call(highStepState);

    let proof = mtree.getProofOrdered(hashes[highStepIndex], highStep);
    const newProof = '0x' + proof.map(e => e.toString('hex')).join('');

    assert(await checkProofOrderedSolidity(proof, root, hashes[highStepIndex], highStep));

    tx = await repeatedGameVerificationGame.performStepVerification(
      gameId,
      lowStepState,
      highHash,
      actions[highStepIndex],
      newProof,
      {from: accounts[1]}
    );

    assert.equal(3, (await repeatedGameVerificationGame.status.call(gameId)).toNumber());
  });

  it("should perform step verification (N-end)", async () => {
    let gameId = gameIdNEnd
    let actions = actionsN
    let mtree = mtreeN
    let hashes = hashesN
    let root = rootN
    let step = stepNEnd

    let lowStepState = toResult(await rpsVM.runSteps.call(actions, step - 1)).state;

    let highStep = step;
    let highStepIndex = step - 1;
    let highStepState = await rpsVM.runStep.call(lowStepState, actions[highStepIndex]);
    let highHash = await rpsVM.merklizeState.call(highStepState);

    let proof = mtree.getProofOrdered(hashes[highStepIndex], highStep);
    const newProof = '0x' + proof.map(e => e.toString('hex')).join('');

    assert(await checkProofOrderedSolidity(proof, root, hashes[highStepIndex], highStep));

    tx = await repeatedGameVerificationGame.performStepVerification(
      gameId,
      lowStepState,
      highHash,
      actions[highStepIndex],
      newProof,
      {from: accounts[1]}
    );

    assert.equal(3, (await repeatedGameVerificationGame.status.call(gameId)).toNumber());
  });
});
