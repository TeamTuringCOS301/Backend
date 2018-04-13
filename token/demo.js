module.exports = (web3, ERPCoin) => {
	let accounts = web3.eth.accounts;
	let erp;

	function name(address) {
		let i = accounts.indexOf(address);
		return i == -1 ? "no account" : `account ${i}`;
	}

	ERPCoin.deployed().then(contract => {
		erp = contract;
		erp.Transfer().watch((error, result) => {
			let {from, to, value} = result.args;
			console.log(`${name(from)} sent ${value} coins to ${name(to)}`);
		});
		erp.Approval().watch((error, result) => {
			let {owner, spender, value} = result.args;
			console.log(`${name(owner)} allowed ${name(spender)} to spend ${value} coins`);
		});
	});

	return {
		async status() {
			for(let i in accounts) {
				let balance = (await erp.balanceOf(accounts[i])).toNumber();
				if(balance) {
					console.log(`account ${i} has ${balance} coins`);
				}
			}
			let total = (await erp.totalSupply()).toNumber();
			console.log(`total coins: ${total}`);
			for(let i in accounts) {
				for(let j in accounts) {
					let allow = (await erp.allowance(accounts[j], accounts[i])).toNumber();
					if(allow) {
						console.log(`account ${i} may spend ${allow} coins from account ${j}`);
					}
				}
			}
		},

		as(sender) {
			let options = {from: accounts[sender]};
			return {
				async reward(to, value) {
					try {
						await erp.reward(accounts[to], value, options);
					} catch(e) {
						console.log("transaction failed");
					}
				},
				async redeem(value) {
					try {
						await erp.redeem(value, options);
					} catch(e) {
						console.log("transaction failed");
					}
				},
				async transfer(to, value) {
					try {
						await erp.transfer(accounts[to], value, options);
					} catch(e) {
						console.log("transaction failed");
					}
				},
				async transferFrom(from, to, value) {
					try {
						await erp.transferFrom(accounts[from], accounts[to], value, options);
					} catch(e) {
						console.log("transaction failed");
					}
				},
				async approve(spender, value) {
					await erp.approve(accounts[spender], value, options);
				}
			};
		}
	};
};
