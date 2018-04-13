pragma solidity ^0.4.17;

import "./StandardToken.sol";

contract ERPCoin is StandardToken("ERP Coin", "ERP", 0, 0) {
	address public owner;

	function ERPCoin() public {
		owner = msg.sender;
	}

	function reward(address to, uint value) public returns (bool) {
		require(msg.sender == owner);
		return doTransfer(0x0, to, value);
	}

	function redeem(uint value) public returns (bool) {
		return doTransfer(msg.sender, 0x0, value);
	}
}
