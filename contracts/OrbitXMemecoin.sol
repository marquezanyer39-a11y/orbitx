// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrbitXMemecoin {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _recipient
    ) {
        require(bytes(_name).length > 0, "name");
        require(bytes(_symbol).length > 0, "symbol");
        require(_recipient != address(0), "recipient");

        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        balanceOf[_recipient] = _initialSupply;

        emit Transfer(address(0), _recipient, _initialSupply);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= value, "allowance");

        unchecked {
            allowance[from][msg.sender] = currentAllowance - value;
        }

        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "to");

        uint256 senderBalance = balanceOf[from];
        require(senderBalance >= value, "balance");

        unchecked {
            balanceOf[from] = senderBalance - value;
        }

        balanceOf[to] += value;

        emit Transfer(from, to, value);
    }
}
