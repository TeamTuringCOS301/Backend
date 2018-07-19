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
See the following sections for more information on what is required.
To start the server, run:

```
npm start
```

[`config.template.json`]: config.template.json
[Node.js]: https://nodejs.org/en/

### MySQL Server

A running MySQL server is required.
Use [`create-tables.sql`] to create the required tables.
[`create-users.sql`] is provided to create users for testing.
It will create a super admin with username `admin` and password `admin`, as well as six users named `darius`, `kyle`, `richard`, `sewis`, `tristan` and `ulrik`, each with the password `password`.

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

### TLS Certificate

A self-signed certificate, to be used for testing, can be generated with:

```
openssl req -new -x509 -out tls-cert.pem -keyout tls-key.pem -nodes -batch
```

Note that this certificate will have to be added to the browser.

### Coin Reward Parameters

The following parameters must be specified in `config.json`:

* `pointMaxAge` - The maximum time a point may stay on the map in milliseconds.
* `clearInterval` - The interval used to clear point exceeding the maximum time.
* `newPointInterval` - The minimum interval (in milliseconds) that a user must wait between submitting visited points.
* `nearRadius` - The radius (in metres) for which points are considered near a user's location.
* `expScale` - The number of nearby points are scaled by this factor before calculating the probability of earning a coin.
* `maxProbability` - The probability when there are no points nearby.

Every time a user submits a visited point, the probability of earning a coin is calculated as `maxProbability * exp(-numPoints * expScale)`.

## APIs

The following APIs are provided over HTTPS.
The content of all `POST` requests should be encoded as JSON, and responses will also be given as JSON.
Login sessions are managed using cookies.
The type `point` is an object with numeric fields `lat` and `lng`.

The API manages seven types of objects: users, admin users, super admin users, conservation areas, visited points, alerts and rewards.
In the requests below, `:user`, `:admin`, `:superadmin`, `:area`, `:point`, `:alert` and `:reward` are numeric IDs referencing the respective objects.
`:since` is a integer timestamp, and only objects newer than that time will be returned.
To list all objects, use the timestamp 0.

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

  Response fields:

  ```
  success: boolean
  ```

* `GET /user/coins` - View the user's current balance and the total number of coins earned.

  Response fields:

  ```
  balance: integer
  totalEarned: integer
  ```

* `POST /user/remove` - Delete the current user's account.

  Required request fields:

  ```
  password: string
  ```

  Response fields:

  ```
  success: boolean
  ```

### Conservation Area Admin API

* `POST /admin/login` - Login as an existing admin.

  Required request fields:

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

* `GET /admin/info` - Request the information stored for the current admin.

  Response fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  area: integer
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

  Response fields:

  ```
  success: boolean
  ```

The rest of the API is only available to a super admin.

* `POST /admin/add` - Create a new admin user.

  Required request fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  area: integer
  ```

  Response fields:

  ```
  success: boolean
  password: string
  ```

* `GET /admin/remove/:admin` - Remove an admin user.

* `GET /admin/list` - List all conservation area admins.

  Response fields:

  ```
  admins: array
  ```

  Fields of each element:

  ```
  id: integer
  username: string
  email: string
  name: string
  surname: string
  area: integer
  ```

### Super Admin API

* `POST /superadmin/login` - Login as an existing admin.

  Required request fields:

  ```
  username: string
  password: string
  ```

  Response fields:

  ```
  success: boolean
  ```

The rest of the API requires that a super admin has already logged in.

* `GET /superadmin/logout` - Terminate a login session.

* `GET /superadmin/info` - Request the information stored for the current admin.

  Response fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  ```

* `POST /superadmin/info` - Update the information stored for the current admin.

  Optional request fields:

  ```
  email: string
  name: string
  surname: string
  ```

* `POST /superadmin/password` - Change password.

  Required request fields:

  ```
  old: string
  new: string
  ```

  Response fields:

  ```
  success: boolean
  ```

* `POST /superadmin/add` - Create a new admin user.

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

* `GET /superadmin/remove/:admin` - Remove an admin user.

* `GET /superadmin/list` - List all conservation area admins.

  Response fields:

  ```
  admins: array
  ```

  Fields of each element:

  ```
  id: integer
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

* `GET /area/info/:area` - Request information about the given area.

  Response fields:

  ```
  name: string
  city: string
  province: string
  middle: point
  border: array of points
  ```

The rest of the API is only available to a super admin.

* `POST /area/info/:area` - Update the information stored for the given area.

  Optional request fields:

  ```
  name: string
  city: string
  province: string
  border: array of points
  ```

* `POST /area/add` - Add a new conservation area.

  Required request fields:

  ```
  name: string
  city: string
  province: string
  border: array of points
  ```

* `GET /area/remove/:area` - Remove the given conservation area.

### Visited Point API

* `GET /point/list/:area/:since` - List recently visited points in the given conservation area.

  Response fields:

  ```
  points: array of points
  latest: integer
  ```

The rest of the API is only available to a registered user.

* `POST /point/add/:area` - Report the user's current location in the given conservation area.
  This will sometimes award the user a coin, but can only be used at limited intervals.

  Required request fields:

  ```
  lat: number
  lng: number
  ```

  Response fields:

  ```
  coin: boolean
  ```

### Alert API

* `POST /alert/add/:area` - Post a new alert in the given conservation area.
  This is only available to a user or the admin of the conservation area.

  Required request fields:

  ```
  title: string
  description: string
  severity: 0, 1 or 2
  location: point
  ```

  Optional request fields:

  ```
  image: base64 string
  ```

* `GET /alert/broadcasts/:area/:since` - List broadcasted alerts for the given area.

  Response fields:

  ```
  alerts: array
  latest: integer
  ```

  Fields of each element:

  ```
  id: integer
  time: integer
  title: string
  description: string
  severity: 0, 1 or 2
  hasImage: boolean
  location: point
  ```

* `GET /alert/image/:alert` - Respond with the image submitted for this alert.
  The response is not encoded as JSON.

The rest of the API is only available to the admin associated with the conservation area.

* `GET /alert/list/:area/:since` - List all alerts for the given area.

  Response fields:

  ```
  alerts: array
  latest: integer
  ```

  Fields of each element:

  ```
  id: integer
  time: integer
  title: string
  description: string
  severity: 0, 1 or 2
  hasImage: boolean
  broadcast: boolean
  location: point
  ```

* `POST /alert/broadcast/:alert` - Broadcast the given alert to users in the conservation area.

  Required request field:

  ```
  broadcast: boolean
  ```

* `GET /alert/remove/:alert` - Remove an alert.

### Reward Store API

* `GET /reward/list` - List available awards.

  Response fields:

  ```
  rewards: array
  ```

  Fields of each element:

  ```
  id: integer
  name: string
  description: string
  amount: integer
  randValue: integer
  coinValue: integer
  area: integer
  ```

* `GET /reward/image/:reward` - Respond with the image submitted for this reward.
  The response is not encoded as JSON.

The rest of the API is only available to an admin.

* `GET /reward/list/own` - List rewards added by this user.

  Response fields:

  ```
  rewards: array
  ```

  Fields of each element:

  ```
  id: integer
  name: string
  description: string
  amount: integer
  randValue: integer
  coinValue: integer
  verified: boolean
  ```

* `POST /reward/add` - Suggest a new reward.

  Required request fields:

  ```
  name: string
  description: string
  image: base64 string
  amount: integer
  randValue: integer
  ```

* `GET /reward/remove/:reward` - Remove the given reward.

The rest of the API is only available to a super admin.

* `GET /reward/list/new` - List rewards that have not yet been verified.

  Response fields:

  ```
  rewards: array
  ```

  Fields of each element:

  ```
  id: integer
  name: string
  description: string
  image: base64 string
  amount: integer
  randValue: integer
  area: integer
  ```

* `POST /reward/verify/:reward` - Verify a suggested reward and set its coin value.

  Required request fields:

  ```
  coinValue: integer
  ```
