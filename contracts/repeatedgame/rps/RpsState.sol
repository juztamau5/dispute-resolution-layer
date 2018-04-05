// Copyright (C) 2018 TrueBit
// See Copyright Notice in LICENSE-MIT.txt

pragma solidity ^0.4.21;

/**
 * @title State helpers for the game Rock Paper Scissors
 */
library RpsState {
  /**
   * @notice Translate a game state into player scores
   *
   * @param state The game state
   *
   * @return The player scores
   */
  function getScores(bytes32 state) public pure returns (uint256 player1Score, uint256 player2Score) {
    player1Score = uint256(state) & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
    player2Score = uint256(state) >> 128;
  }

  /**
   * @notice Translate player scores into a game state
   *
   * @param player1Score The player 1 score
   * @param player2Score The player 2 score
   *
   * @return The game state
   */
  function getState(uint256 player1Score, uint256 player2Score) public pure returns (bytes32 state) {
    state = bytes32(player1Score | (player2Score << 128));
  }
}
