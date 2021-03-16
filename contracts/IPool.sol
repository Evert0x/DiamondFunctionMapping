//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";

interface IPool {
    event Deposit(address _token, uint256 _amount);

    // Pool functions
    function stake(uint256 _amount, address _token) external;

    function getStake(address _user, address _token)
        external
        view
        returns (uint256);

    // Pool manager function
    function addToken(address _token) external;
}
