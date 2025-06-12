const cds = require("@sap/cds");
const cors = require("cors");
const adapterProxy = require("@sap/cds-odata-v2-adapter-proxy")

cds.on("bootstrap", (app) => {
    app.use(adapterProxy());
    app.use(cors());
    app.get("/alive", (_, res) => {
        res.status(200).send("Server is alive");
    });
});

if (process.env.NODE_ENV !== 'Production') {
    require("dotenv").config();
}

module.exports = cds.server;