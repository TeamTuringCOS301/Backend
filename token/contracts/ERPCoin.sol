pragma solidity ^0.4.17;

import "./StandardToken.sol";

contract ERPCoin is StandardToken("ERP Coin", "ERP", 0, 0) {
	address public owner;

	constructor() public {
		owner = msg.sender;
	}

	function rewardCoins(address to, uint value) public returns (bool) {
		require(msg.sender == owner && to != 0x0);
		return doTransfer(0x0, to, value);
	}
}
