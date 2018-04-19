# Backend

Source code for the application and database layers.

## Usage

Install required dependencies with:

```
npm install
```

A running MySQL server is needed, and its details must be specified in [`database.js`].
Similarly, a web3 provider must be set in [`token.js`].
The current details are for a Truffle node, which can be started as described in the [`token` README].
To start the server, run:

```
npm start
```

[`database.js`]: database.js
[`token.js`]: token.js
[`token` README]: token/README.md
