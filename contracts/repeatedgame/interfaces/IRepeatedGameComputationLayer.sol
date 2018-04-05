// Copyright (C) 2018 TrueBit
// See Copyright Notice in LICENSE-MIT.txt

pragma solidity ^0.4.21;

/**
 * @title Computation layer interface
 */
interface IRepeatedGameComputationLayer {
  /**
   * @notice Play a step in the game
   *
   * @param currentState The current game state, encoded as bytes32
   * @param action The action for the step, encoded as bytes32
   *
   * @return The new game state
   */
  function runStep(bytes32 currentState, bytes32 action) external pure returns (bytes32 newState);

  /**
   * @notice Get a hash of the game state
   *
   * @param state The game state
   *
   * @return merkleRoot A Merkle root for the state
   */
  function merklizeState(bytes32 state) external pure returns (bytes32 merkleRoot);
}
