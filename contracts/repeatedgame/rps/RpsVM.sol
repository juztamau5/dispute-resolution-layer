// Copyright (C) 2018 TrueBit
// See Copyright Notice in LICENSE-MIT.txt

pragma solidity ^0.4.21;

import "./RpsAction.sol";
import "./RpsState.sol";
import "../interfaces/IRepeatedGameComputationLayer.sol";

/**
 * @title Rock Paper Scissors game
 */
contract RpsVM is IRepeatedGameComputationLayer {
  /**
   * @notice Implementation of IRepeatedGameComputationLayer.runStep()
   */
  function runStep(bytes32 currentState, bytes32 action) external pure returns (bytes32 newState) {
    var (player1Score, player2Score) = RpsState.getScores(currentState); // TODO: Remove "var" keyword for Solidity 0.4.21
    var (player1Move, player2Move) = RpsAction.getMoves(action); // TODO: Remove "var" keyword for Solidity 0.4.21

    if (player1Move == RpsAction.Move.ROCK) {
      if (player2Move == RpsAction.Move.SCISSORS) {
        ++player1Score;
      } else if (player2Move == RpsAction.Move.PAPER) {
        ++player2Score;
      }
    } else if (player1Move == RpsAction.Move.PAPER) {
      if (player2Move == RpsAction.Move.ROCK) {
        ++player1Score;
      } else if (player2Move == RpsAction.Move.SCISSORS) {
        ++player2Score;
      }
    } else if (player1Move == RpsAction.Move.SCISSORS) {
      if (player2Move == RpsAction.Move.PAPER) {
        ++player1Score;
      } else if (player2Move == RpsAction.Move.ROCK) {
        ++player2Score;
      }
    }

    newState = RpsState.getState(player1Score, player2Score);
  }

  /**
   * @notice Implementation of IRepeatedGameComputationLayer.merklizeState()
   */
  function merklizeState(bytes32 state) external pure returns (bytes32 merkleRoot) {
    merkleRoot = keccak256(state);
  }

  /**
   * @notice Used for generating results for query/response
   *
   * @dev Run offchain
   *
   * @param actions The list of actions
   * @param numSteps The number of steps to run
   */
  function runSteps(bytes32[] actions, uint numSteps) external view returns (bytes32 state, bytes32 stateHash) {
    for (uint i = 0; i < actions.length && i < numSteps; ++i) {
      bytes32 nextAction = actions[i];
      state = this.runStep(state, nextAction); 
    }

    stateHash = this.merklizeState(state);
  }
}
