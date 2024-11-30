var express = require("express");
var app = express();
app.use(express.json());
// view engine setup

app.get("/check", async (req, res) => {
	res.status(200).end();
});

app.use(function (req, res) {
	res.status(404).end();
});

module.exports = app;
