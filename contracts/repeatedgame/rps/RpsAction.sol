// Copyright (C) 2018 TrueBit
// See Copyright Notice in LICENSE-MIT.txt

pragma solidity ^0.4.21;

/**
 * @title Action helpers for Rock Paper Scissors
 *
 * @dev Rounds in RPS are played simultaneously. The action of each round is
 * the moves of all players.
 */
library RpsAction {
  /**
   * @notice Moves a player can play in a round of Rock Paper Scissors
   */
  enum Move {
    INVALID,
    ROCK,
    PAPER,
    SCISSORS
  }

  /**
   * @notice Table of values for the moves
   */
  uint public constant ROCK_ID = 0;
  uint public constant PAPER_ID = 1;
  uint public constant SCISSORS_ID = 2;

  /**
   * @notice Translate an action frame into player moves
   *
   * @dev Actions consist of four bits:
   *
   *    Bits0-1: Player 1 move
   *    Bits2-3: Player 2 move
   *
   * @param action The action, encoded as bytes32
   *
   * @return The player moves
   */
  function getMoves(bytes32 action) public pure returns (Move player1Move, Move player2Move) {
    uint8 frame = uint8(action);

    uint8 player1Value = (frame & 0x3);
    uint8 player2Value = ((frame >> 2) & 0x3);

    player1Move = translateMove(player1Value);
    player2Move = translateMove(player2Value);
  }

  /**
   * @notice Translate a value into a Move enum
   *
   * @param value The move value defined by the private ID constants above
   *
   * @return The Move enum
   */
  function translateMove(uint8 value) private pure returns (Move) {
    if (value == ROCK_ID)
      return Move.ROCK;
    else if (value == PAPER_ID)
      return Move.PAPER;
    else if (value == SCISSORS_ID)
      return Move.SCISSORS;

    return Move.INVALID;
  }
}
