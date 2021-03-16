//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";

import "./LibPoolStorage.sol";

contract Pool {
    event Deposit(address _token, uint256 _amount);

    function stake(uint256 _amount) external {
        (address token, PoolStorage.Base storage d) = baseData();

        emit Deposit(token, _amount);
        d.stakes[msg.sender] += _amount;
    }

    function getStake(address _user) external view returns (uint256) {
        (, PoolStorage.Base storage d) = baseData();

        return d.stakes[msg.sender];
    }

    function baseData()
        internal
        view
        returns (address token, PoolStorage.Base storage s)
    {
        token = bps();
        s = PoolStorage.poolStorage(token);
        require(s.initialized, "INVALID_TOKEN");
    }

    function bps() internal pure returns (address rt) {
        // These fields are not accessible from assembly
        bytes memory array = msg.data;
        uint256 index = msg.data.length;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
            rt := and(
                mload(add(array, index)),
                0xffffffffffffffffffffffffffffffffffffffff
            )
        }
    }
}
