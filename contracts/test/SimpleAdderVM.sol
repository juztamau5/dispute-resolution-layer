pragma solidity ^0.4.18;

import "../IComputationLayer.sol";

contract SimpleAdderVM is IComputationLayer {

    //Used directly only to run on chain computation, otherwise use runSteps
    //VM State (4 Registers):
    //Reg0: Stack0 Input
    //Reg1: Stack1 Accum
    //Reg2: Stack2 Result
    //Reg3: StepCounter
    function runStep(bytes32[3] currentState, bytes32 nextInput) public pure returns (bytes32[3] newState) {
        newState[0] = nextInput;
        newState[1] = bytes32(uint(currentState[1]) + uint(nextInput));
        newState[2] = bytes32(uint(currentState[2]) + 1);
    }

    //Simple list merklization (works like sum)
    function merklizeState(bytes32[3] state) public pure returns (bytes32 merkleRoot) {
        for (uint i = 0; i < state.length; i++) {
            if (i == 0) {
                merkleRoot = state[0];
            } else {
                merkleRoot = keccak256(merkleRoot, state[i]);
            }
        }
    }

    //Used for generating results for query/response
    //Run offchain
    function runSteps(bytes32[] program, uint numSteps) public pure returns (bytes32[3] state, bytes32 stateHash) {
        for (uint i = 0; i < program.length && i < numSteps; i++) {
            bytes32 nextInstruction = program[i];
            state = runStep(state, nextInstruction);
        }

        stateHash = merklizeState(state);
    }

}