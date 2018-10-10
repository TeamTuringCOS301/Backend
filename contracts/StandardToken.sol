pragma solidity ^0.4.17;

contract StandardToken {
	string public name;
	string public symbol;
	uint8 public decimals;

	uint public totalSupply;
	mapping(address => uint) public balanceOf;
	mapping(address => mapping(address => uint)) public allowance;

	event Transfer(address indexed from, address indexed to, uint value);
	event Approval(address indexed owner, address indexed spender, uint value);

	constructor(string n, string s, uint8 d, uint t) public {
		name = n;
		symbol = s;
		decimals = d;
		totalSupply = t;
		balanceOf[msg.sender] = t;
	}

	function transfer(address to, uint value) public returns (bool) {
		require(to != 0x0);
		return doTransfer(msg.sender, to, value);
	}

	function transferFrom(address from, address to, uint value) public returns (bool) {
		require(allowance[from][msg.sender] >= value && to != 0x0);
		allowance[from][msg.sender] -= value;
		return doTransfer(from, to, value);
	}

	function approve(address spender, uint value) public returns (bool) {
		allowance[msg.sender][spender] = value;
		emit Approval(msg.sender, spender, value);
		return true;
	}

	function doTransfer(address from, address to, uint value) internal returns (bool) {
		if(from == 0x0) {
			totalSupply += value;
		} else {
			require(balanceOf[from] >= value);
			balanceOf[from] -= value;
		}
		if(to == 0x0) {
			totalSupply -= value;
		} else {
			balanceOf[to] += value;
		}
		emit Transfer(from, to, value);
		return true;
	}
}
