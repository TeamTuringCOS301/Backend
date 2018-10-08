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
See the following section for more information on what is required.
To start the server, run:

```
npm start
```

Root privileges may be required to bind to ports 80 and 443.

[`config.template.json`]: config.template.json
[Node.js]: https://nodejs.org/en/

### The Configuration File

* `coinRewards` - Various parameters that determine when users are rewarded with coins.

  * `newPointInterval` - The minimum interval (in milliseconds) that a user must wait between submitting visited points.
  * `pointMaxAge` - The maximum time (in milliseconds) that a point may stay on the map.
  * `clearInterval` - The interval (in milliseconds) used to clear points exceeding the maximum age.
  * `nearRadius` - The radius (in metres) for which points are considered near a user's location.
  * `expScale` - The number of nearby points are scaled by this factor before calculating the probability of earning a coin.
  * `maxProbability` - The probability when there are no points nearby.

  Every time a user submits a visited point, the probability of earning a coin is calculated as `maxProbability * exp(-numPoints * expScale)`.

* `email` - Email configuration.

  * `from` - The "From" field to use for emails sent by the server.
  * `transport` - Options to create a [`nodemailer`] transport.

* `enableCors` - Whether to enable CORS, allowing other origins to access the HTTPS API.

* `logRequests` - Whether to log API requests to standard output.

* `maxImageSize` - The maximum size for images uploaded by users.

* `mount` - This contains an entry for each front-end app.
  The key specifies at which URL to mount the app.
  The value is the location of the `www` directory of the app.
  Note that the `ionic build` command must be run for each app to update its `www` directory.

* `mysql` - Connection information for the MySQL server.
  Use [`create-tables.sql`] to create the required tables.
  [`create-admin.sql`] is provided to create a super admin with username `admin` and password `admin`, for testing.

* `sessionCookie` - Configuration for the cookie used to implement login sessions.

  * `maxAge` - The time (in milliseconds) after the user's last activity when the session will expire.
  * `secret` - A secret value. Please change this from the default.

* `tls` - The certificate to be used when establishing a TLS connection for HTTPS, as well as its associated key and passphrase.
  A self-signed certificate, to be used for testing, can be generated with:

  ```
  openssl req -new -x509 -out tls-cert.pem -keyout tls-key.pem -nodes -batch
  ```

  Note that this certificate will have to be added to the browser.

* `web3Provider` - A `web3` provider to handle communication with the blockchain.
  The smart contract in [`token`] should already be deployed on the network.

  The configuration in `config.template.json` is for a [Truffle] development provider.
  Start it with:

  ```
  npm run truffle develop
  ```

  Then type `migrate --reset` to deploy the smart contract.

[`create-admin.sql`]: sql/create-admin.sql
[`create-tables.sql`]: sql/create-tables.sql
[`nodemailer`]: https://nodemailer.com/
[`token`]: token
[Truffle]: http://truffleframework.com/

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

* `POST /api/user/add` - Register a new user.
  This will also perform a login.

  Required request fields:

  ```
  username: string
  email: string
  password: string
  name: string
  surname: string
  ```

  Response fields:

  ```
  success: boolean
  ```

* `POST /api/user/login` - Login as an existing user.

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

* `GET /api/user/logout` - Terminate a login session.

* `GET /api/user/info` - Request the information stored for the current user.

  Response fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  walletAddress: string or null
  coinBalance: integer
  ```

* `POST /api/user/update` - Update the information stored for the current user.

  Required request fields:

  ```
  email: string
  name: string
  surname: string
  ```

* `POST /api/user/address` - Update the user's Ethereum wallet address.

  Optional request fields:

  ```
  walletAddress: string
  ```

* `POST /api/user/password` - Change password.

  Required request fields:

  ```
  old: string
  new: string
  ```

  Response fields:

  ```
  success: boolean
  ```

* `POST /api/user/remove` - Delete the current user's account.

  Required request fields:

  ```
  password: string
  ```

  Response fields:

  ```
  success: boolean
  ```

### Conservation Area Admin API

* `POST /api/admin/login` - Login as an existing admin.

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

* `GET /api/admin/logout` - Terminate a login session.

* `GET /api/admin/info` - Request the information stored for the current admin.

  Response fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  area: integer
  areaName: string
  ```

* `POST /api/admin/update` - Update the information stored for the current admin.

  Required request fields:

  ```
  email: string
  name: string
  surname: string
  ```

* `POST /api/admin/password` - Change password.

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

* `POST /api/admin/add` - Create a new admin user.

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
  ```

* `GET /api/admin/remove/:admin` - Remove an admin user.

* `GET /api/admin/list` - List all conservation area admins.

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
  areaName: string
  ```

### Super Admin API

* `POST /api/superadmin/login` - Login as an existing admin.

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

* `GET /api/superadmin/logout` - Terminate a login session.

* `GET /api/superadmin/info` - Request the information stored for the current admin.

  Response fields:

  ```
  username: string
  email: string
  name: string
  surname: string
  ```

* `POST /api/superadmin/update` - Update the information stored for the current admin.

  Required request fields:

  ```
  email: string
  name: string
  surname: string
  ```

* `POST /api/superadmin/password` - Change password.

  Required request fields:

  ```
  old: string
  new: string
  ```

  Response fields:

  ```
  success: boolean
  ```

### Conservation Area API

* `GET /api/area/list` - List all conservation areas.

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

* `GET /api/area/info/:area` - Request information about the given area.

  Response fields:

  ```
  name: string
  city: string
  province: string
  middle: point
  border: array of points
  ```

The rest of the API is only available to a super admin.

* `POST /api/area/update/:area` - Update the information stored for the given area.

  Required request fields:

  ```
  name: string
  city: string
  province: string
  border: array of points
  ```

* `POST /api/area/add` - Add a new conservation area.

  Required request fields:

  ```
  name: string
  city: string
  province: string
  border: array of points
  ```

* `GET /api/area/remove/:area` - Remove the given conservation area.

### Visited Point API

* `GET /api/point/list/:area/:since` - List recently visited points in the given conservation area.

  Response fields:

  ```
  points: array of points
  latest: integer
  ```

The rest of the API is only available to a registered user.

* `POST /api/point/add/:area` - Report the user's current location in the given conservation area.
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

* `POST /api/alert/add/:area` - Post a new alert in the given conservation area.
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

* `GET /api/alert/broadcasts/:area/:since` - List broadcasted alerts for the given area.

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

* `GET /api/alert/image/:alert` - Respond with the image submitted for this alert.
  The response is not encoded as JSON.

The rest of the API is only available to the admin associated with the conservation area.

* `GET /api/alert/list/:area/:since` - List all alerts for the given area.

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

* `POST /api/alert/update/:alert` - Update the information stored for the given alert.

  Required request field:

  ```
  title: string
  description: string
  severity: 0, 1 or 2
  broadcast: boolean
  location: point
  ```

  Optional request fields:

  ```
  image: base64 string
  ```

* `GET /api/alert/remove/:alert` - Remove an alert.

### Reward Store API

* `GET /api/reward/list` - List available awards.

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
  areaName: string
  ```

* `GET /api/reward/image/:reward` - Respond with the image submitted for this reward.
  The response is not encoded as JSON.

The following request is only available to a registered user.

* `GET /api/reward/buy/:reward` - Buy a reward.
  If the user's coins have already been exported to an Ethereum wallet, use the contract function instead.

The rest of the API is only available to an admin.

* `GET /api/reward/list/own` - List rewards added by this user.

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

* `POST /api/reward/add` - Suggest a new reward.

  Required request fields:

  ```
  name: string
  description: string
  image: base64 string
  amount: integer
  randValue: integer
  ```

* `POST /api/reward/update/:reward` - Update the information stored for a reward.

  Required request fields:

  ```
  name: string
  description: string
  amount: integer
  randValue: integer
  ```

  Optional request fields:

  ```
  image: base64 string
  ```

* `GET /api/reward/remove/:reward` - Remove the given reward.

The rest of the API is only available to a super admin.

* `GET /api/reward/list/new` - List rewards that have not yet been verified.

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
  areaName: string
  ```

* `POST /api/reward/verify/:reward` - Verify a suggested reward and set its coin value.

  Required request fields:

  ```
  verify: boolean
  coinValue: integer
  ```

### Smart Contract API

* `GET /api/contract` - Get information about the `ERPCoin` smart contract.

  Response fields:

  ```
  abi: array
  address: string
  ```
