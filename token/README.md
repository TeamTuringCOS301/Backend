# ERP Coin Ethereum Token

This directory contains Ethereum smart contracts that implement the ERP Coin token.
The [`StandardToken`] contract implements the [ERC20] interface, so that it can be used from wallets.
The [`ERPCoin`] contract extends `StandardToken` to provide the custom functionality needed for this project.

[`ERPCoin`]: contracts/ERPCoin.sol
[`StandardToken`]: contracts/StandardToken.sol
[ERC20]: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
