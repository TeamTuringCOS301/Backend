const db = require("./src/db-mysql.js");
const app = require("./src/app.js")(db);

app.listen(8080); // TODO: Use HTTPS.
