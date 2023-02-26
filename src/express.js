
const prettyTime = require("pretty-ms");

var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var crypto = require("crypto")
const { queryUpdate, queryDocument, addDocument, queryByIndex } = require("./faunadb");
const punnynpm = require("punycode/") // "/" to shadow inner nodejs punycode
var app = express();

app.use((req, res, next) => {
    //res.setHeader("Access-Control-Allow-Origin", "*"); // @todo
    //res.setHeader("Access-Control-Allow-Headers", "Content-type");
    return next();
});
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    keyGenerator: (req, res) => req.ip,
    statusCode: 200,
    headers: false,
    message: `{"err": "Too many requests, please wait a while"}`
});

//  apply to all requests
app.use(limiter);

app.use(express.static("./public"))


const GUESS_FAUNA_DB = "guesses";
const GUESS_INDEX_FAUNA_DB = "guess_value_search"
const VISIT_FAUNA_DB = "visits";
const COOKIE_ANON = "anon_id";

app.get("/api/status", async (req, resp) => {
    var myip = [req.ip, ...req.ips, req.header("x-forwarded-for")];
    var myid = req.cookies[COOKIE_ANON] // string of long number

    if (myid) {
        try {
            let old = await queryDocument(VISIT_FAUNA_DB, myid);
            await queryUpdate(VISIT_FAUNA_DB, myid, { ip: myip, updated: Date.now(), count: (old?.data?.count || 1) + 1 })
        }
        catch (e) {
            myid = null;
        }
    }

    if (!myid /*error or not found(null)*/) {
        let hostname = req.hostname;
        try {
            hostname += " - " + punnynpm.toUnicode(req.hostname.split(':')[0])
        } catch (error) { }

        let newDoc = await addDocument(VISIT_FAUNA_DB, {
            ip: myip,
            host: hostname,
            created: Date.now(), updated: Date.now(),
            count: 1
        })
        const newID = newDoc.ref.id;
        resp.cookie(COOKIE_ANON, newID, { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), httpOnly: true })
    }

    resp.send("ok")
})

app.get("/api/guess", async (req, resp) => {
    var guessParam = req?.query?.guess
    var precheckHash = req?.query?.precheckHash
    var imageHash = req?.query?.imageHash
    var myid = req.cookies[COOKIE_ANON] || "(no-id)" // string of long number



    if (guessParam) {
        let old = null;
        try {
            old = await queryByIndex(GUESS_INDEX_FAUNA_DB, [guessParam])
            const oldId = old.ref.id;
            console.log(oldId, old);
            await queryUpdate(GUESS_FAUNA_DB, oldId, {
                lastUser: myid,
                updated: Date.now(),
                count: (old?.data?.count || 1) + 1
            })
            return resp.send({ id: oldId })
        } catch (e1) {
            // console.log("err1", e1)
            try {
                let newDoc = await addDocument(GUESS_FAUNA_DB, {
                    imageHash,
                    precheckHash,
                    guess: guessParam,
                    firstUser: myid,
                    created: Date.now(), updated: Date.now(), count: 1
                })
                const newID = newDoc.ref.id;
                return resp.send({ id: newID })
            } catch (e2) {
                //console.log("err2", e2)
                return resp.status(500).send({ error: [`${e1}`, `${e2}`] })
            }
        }
    }

    resp.status(500).send({ error: "not-reach" })
})

app.get("/api/", (req, resp) => {
    resp.send("my default home");
});

module.exports = { app };