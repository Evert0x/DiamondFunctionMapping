//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";

import "./LibPoolStorage.sol";

contract PoolManager {
    function addToken(address _token) external {
        PoolStorage.poolStorage(_token).token = _token;
    }
}
