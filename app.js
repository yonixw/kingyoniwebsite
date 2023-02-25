const { app } = require("./src/express");
const { version } = require("./api/version");

if (process.env.VERCEL !== "1") {
    // only if not in vercel
    app.get("/api/health", (rq, rs) => {
        rs.send("OK [express] " + version);
    });

    app.get("/", (rq, rs) => {
        rs.send("Home [express] " + version);
    });

    var listener = app.listen(8080, function () {
        console.log("Listening on port " + listener.address().port);
    });
}