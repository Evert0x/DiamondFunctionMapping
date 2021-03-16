//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";

library PoolStorage {
    struct Base {
        bool initialized;
        mapping(address => uint256) stakes;
    }

    function poolStorage(address _token) internal pure returns (Base storage bs) {
        bytes32 position = keccak256(abi.encode("diamond.token.", _token));
        assembly {
            bs.slot := position
        }
    }
}
