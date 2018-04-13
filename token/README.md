# ERP Coin Ethereum Token

This directory contains Ethereum smart contracts that implement the ERP Coin token.
The [`StandardToken`] contract implements the [ERC20] interface, so that it can be used from wallets.
The [`ERPCoin`] contract extends `StandardToken` to provide the custom functionality needed for this project.

## Demo Interface

A basic interface has been created to interact with the smart contract during our first demo.
This interface is used from the [Truffle] console.
To start, run the following commands in the `truffle develop` console:

```
migrate --reset
let erp = require("./demo.js")(web3, ERPCoin);
```

The `erp` object may be used to interact with the contract.
Accounts are referenced by the indices 0 through 9.
The `erp.status()` function will print the current status, including account balances.
The following commands will each execute the corresponding function on the smart contract, from account `i`:

```
erp.as(i).reward(to, value);
erp.as(i).redeem(value);
erp.as(i).transfer(to, value);
erp.as(i).transferFrom(from, to, value);
erp.as(i).approve(spender, value);
```

Note that account 0 is the only one authorised to mint new coins with `reward()`.
`redeem()` currently burns the coins, but will eventually be linked to a reward.

[`ERPCoin`]: contracts/ERPCoin.sol
[`StandardToken`]: contracts/StandardToken.sol
[ERC20]: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
[Truffle]: http://truffleframework.com/
