pragma solidity ^0.4.17;

import "./StandardToken.sol";

contract ERPCoin is StandardToken("ERP Coin", "ERP", 0, 0) {
	address public owner;

	event Purchase(address indexed buyer, uint indexed reward, uint value);

	constructor() public {
		owner = msg.sender;
	}

	function rewardCoins(address to, uint value) public {
		require(msg.sender == owner && to != 0x0);
		doTransfer(0x0, to, value);
	}

	function buyReward(uint reward, uint value) public {
		doTransfer(msg.sender, 0x0, value);
		emit Purchase(msg.sender, reward, value);
	}
}
