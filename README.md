# ERP Coin Backend

Source code for the application and database layers.

## Usage

This is intended to be run with [Node.js] version 10.
Install required dependencies with:

```
npm install
```

A file named `config.json` must be created.
See [`config.template.json`] for an example.
To set up the servers referenced in this file, see the following sections.
To start the server, run:

```
npm start
```

[`config.template.json`]: config.template.json
[Node.js]: https://nodejs.org/en/

### MySQL Server

A running MySQL server is required.
Use [`create-tables.sql`] to create the required tables.
[`create-admin.sql`] is provided to create an admin user for testing, with username `admin` and password `admin`.

[`create-admin.sql`]: sql/create-admin.sql
[`create-tables.sql`]: sql/create-tables.sql

### Web3 Provider

The configuration in `config.template.json` is for a [Truffle] development provider.
Start it with:

```
npm run truffle develop
```

Then type `migrate --reset` to deploy the smart contract.

[Truffle]: http://truffleframework.com/

## APIs

The following APIs are provided over HTTP.
The content of all `POST` requests should be encoded as JSON.
Responses will also be given as JSON.
Login sessions are managed using cookies.

### User API

* `POST /user/register` - Register a new user.
  This will also perform a login.

  Required fields:

  ```
  username: string
  email: string
  password: string
  name: string
  surname: string
  cellNumber: string
  ```

  Response fields:

  ```
  success: boolean
  ```

* `POST /user/login` - Login as an existing user.

  Required fields:

  ```
  username: string
  password: string
  ```

  Response fields:

  ```
  success: boolean
  ```

The rest of the API requires that a user has already logged in.

* `GET /user/logout` - Terminate a login session.

  Response fields: none

### Admin API

* `POST /admin/login` - Login as an existing admin.

  Required fields:

  ```
  username: string
  password: string
  ```

  Response fields:

  ```
  success: boolean
  ```

The rest of the API requires that an admin has already logged in.

* `GET /admin/logout` - Terminate a login session.

  Response fields: none
