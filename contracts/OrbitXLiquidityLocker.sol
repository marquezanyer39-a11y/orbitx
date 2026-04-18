// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOrbitXLockToken {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract OrbitXLiquidityLocker {
    address public immutable lpToken;
    address public immutable beneficiary;
    uint256 public immutable unlockTime;
    uint256 public immutable createdAt;

    event LiquidityLocked(
        address indexed lpToken,
        address indexed beneficiary,
        uint256 amount,
        uint256 unlockTime
    );
    event LiquidityWithdrawn(address indexed beneficiary, uint256 amount);

    constructor(address _lpToken, address _beneficiary, uint256 _unlockTime) {
        require(_lpToken != address(0), "lp_token");
        require(_beneficiary != address(0), "beneficiary");
        require(_unlockTime > block.timestamp, "unlock");

        lpToken = _lpToken;
        beneficiary = _beneficiary;
        unlockTime = _unlockTime;
        createdAt = block.timestamp;
    }

    function lockedBalance() public view returns (uint256) {
        return IOrbitXLockToken(lpToken).balanceOf(address(this));
    }

    function emitLocked(uint256 amount) external {
        require(msg.sender == beneficiary, "beneficiary");
        emit LiquidityLocked(lpToken, beneficiary, amount, unlockTime);
    }

    function withdraw() external {
        require(msg.sender == beneficiary, "beneficiary");
        require(block.timestamp >= unlockTime, "locked");

        uint256 amount = IOrbitXLockToken(lpToken).balanceOf(address(this));
        require(amount > 0, "empty");
        require(IOrbitXLockToken(lpToken).transfer(beneficiary, amount), "transfer");

        emit LiquidityWithdrawn(beneficiary, amount);
    }
}
