const config = require("./src/config.js");
const db = require("./src/database.js");
const app = require("./src/app.js")(config, db);

app.listen(config.apiPort); // TODO: use HTTPS
