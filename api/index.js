const { app } = require("../src/express");
const { version } = require("./version");

if (process.env.VERCEL === "1") {
    app.get("/api/health", (rq, rs) => {
        rs.send("OK [VERCEL] " + version);
    });

    module.exports = app;
}