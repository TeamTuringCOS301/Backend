pragma solidity ^0.4.17;

import "./StandardToken.sol";

contract ERPCoin is StandardToken("ERP Coin", "ERP", 0, 0) {
	address public owner;
	mapping(address => uint) public totalEarned;

	event Reward(address indexed to, uint value);

	constructor() public {
		owner = msg.sender;
	}

	function reward(address to, uint value) public returns (bool) {
		require(msg.sender == owner && to != 0x0);
		if(balanceOf[owner] < value) {
			doTransfer(0x0, owner, value - balanceOf[owner]);
		}
		totalEarned[to] += value;
		emit Reward(to, value);
		return doTransfer(owner, to, value);
	}
}
