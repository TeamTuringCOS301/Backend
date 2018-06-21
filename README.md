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
Responses will also be given as JSON, unless no response fields are listed, in which case the body will be empty.
Login sessions are managed using cookies.
The type `point` is an object with numeric fields `lat` and `lng`.

### User API

* `POST /user/add` - Register a new user.
  This will also perform a login.

  Required request fields:

  ```
  username: string
  email: string
  password: string
  name: string
  surname: string
  walletAddress: string
  ```

  Response fields:

  ```
  success: boolean
  ```

* `POST /user/login` - Login as an existing user.

  Required request fields:

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

* `GET /user/info` - Request the information stored for the current user.

  Response fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  walletAddress: string
  ```

* `POST /user/info` - Update the information stored for the current user.

  Optional request fields:

  ```
  email: string
  name: string
  surname: string
  walletAddress: string
  ```

* `POST /user/password` - Change password.

  Required request fields:

  ```
  old: string
  new: string
  ```

### Admin API

* `POST /admin/login` - Login as an existing admin.

  Required request fields:

  ```
  username: string
  password: string
  ```

  Response fields:

  ```
  success: boolean
  superAdmin: boolean
  ```

The rest of the API requires that an admin has already logged in.

* `GET /admin/logout` - Terminate a login session.

* `GET /admin/super` - Query whether the current admin may add other admins.

  Response fields:

  ```
  superAdmin: boolean
  ```

* `GET /admin/info` - Request the information stored for the current admin.

  Response fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  ```

* `POST /admin/info` - Update the information stored for the current admin.

  Optional request fields:

  ```
  email: string
  name: string
  surname: string
  ```

* `POST /admin/password` - Change password.

  Required request fields:

  ```
  old: string
  new: string
  ```

The rest of the API is only available to a super admin.

* `POST /admin/add` - Create a new admin user.

  Required request fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  ```

  Response fields:

  ```
  success: boolean
  password: string
  ```

* `POST /admin/remove` - Remove an admin user.

  Required request fields:

  ```
  username: string
  ```

* `GET /admin/list` - List all non-super admins.

  Response fields:

  ```
  admins: array
  ```

  Fields of each element:

  ```
  username: string
  email: string
  name: string
  surname: string
  ```

### Conservation Area API

* `GET /area/list` - List all conservation areas.

  Response fields:

  ```
  areas: array
  ```

  Fields of each element:

  ```
  id: number
  name: string
  city: string
  province: string
  middle: point
  ```

* `GET /area/info/:id` - Request information about the area with id `:id`.

  Response fields:

  ```
  name: string
  city: string
  province: string
  middle: point
  border: array of points
  ```

The rest of the API is only available to a super admin.

* `POST /area/info/:id` - Update the information stored for area `:id`.

  Optional request fields:

  ```
  name: string
  city: string
  province: string
  border: array of points
  admin: string
  ```

* `POST /area/add` - Add a new conservation area.

  Required request fields:

  ```
  name: string
  city: string
  province: string
  border: array of points
  admin: string
  ```

* `GET /area/remove/:id` - Remove the conservation area with id `:id`.

### Visited Point API

This API is only available to registered users.

* `GET /point/list/:id` - List the recently visited points in conservation area `:id`.

  Response fields:

  ```
  points: array of points
  latest: integer
  ```

* `GET /point/list/:id/:since` - List the points visited since time `:since` (the `latest` field of a previous a request).

  Response fields:

  ```
  points: array of points
  latest: integer
  ```

* `POST /point/add/:id` - Report the user's current location in conservation area `:id`.
  This will sometimes award the user a coin, but can only be used at limited intervals.

  Response fields:

  ```
  coin: boolean
  ```
