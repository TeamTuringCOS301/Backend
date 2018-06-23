pragma solidity ^0.4.17;

import "./StandardToken.sol";

contract ERPCoin is StandardToken("ERP Coin", "ERP", 0, 0) {
	address public owner;
	mapping(address => uint) public totalEarned;

	event CoinReward(address indexed to);

	constructor() public {
		owner = msg.sender;
	}

	function rewardCoin(address to) public returns (bool) {
		require(msg.sender == owner && to != 0x0);
		++totalEarned[to];
		emit CoinReward(to);
		if(balanceOf[owner] == 0) {
			return doTransfer(0x0, to, 1);
		} else {
			return doTransfer(owner, to, 1);
		}
	}
}
