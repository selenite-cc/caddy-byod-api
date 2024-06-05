var express = require("express");
var fs = require("fs");
var app = express();
app.use(express.json());
// view engine setup

app.get("/check", async (req, res) => {
	let links = [];
	fs.readFile("./domains.json", "utf8", (err, data) => {
		if (err) {
			console.error(err);
			res.status(404).end();
			return;
		}
		links = JSON.parse(data);
		if (links.indexOf(req.query.domain) >= 0) {
			res.status(200).end();
		} else {
			res.status(404).end();
		}
	});
});
app.post("/add", async (req, res) => {
	let links = [];
	fs.readFile("./domains.json", "utf8", async (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		links = JSON.parse(data);
		let linkRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
		let httpRegex = /https?:\/\//;
		let pathRegex = /[a-z 0-9 -]\/{1}.*/;
		let characterRegex = /[^a-zA-Z 0-9 - . / : ]/g;
		console.log(req.body);
		let reason;
		if (req.body.domain && req.body.domain.length < 70) {
			console.log("domain exists and is short enough");
			let link = req.body.domain;
			link = link.replace(characterRegex, "");
			if (linkRegex.test(req.body.domain)) {
				console.log("is link");
				if (httpRegex.test(link)) {
					link.replace(httpRegex, "");
					console.log("http found");
				}
				if (pathRegex.test(link)) {
					link = link.substr(0, link.indexOf("/"));
					console.log("path found");
				}
				console.log("running fetch");
				let dns = await (await fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${link}`, { headers: { Origin: "https://api-ninjas.com" } })).json();
				console.log("fetch completed");
				console.log("correct domain");
				links.push(link);
				fs.writeFile("./domains.json", JSON.stringify(links), (err) => {
					if (err) {
						console.error(err);
						reason = error;
					} else {
						res.status(200).end();
					}
				});
				axios.get(`https://${link}`)
				return;
			} else {
				reason = "Link wasn't detected as a valid link.";
			}
		} else {
			reason = "No link or link was too long. (should not be possible, contact @skysthelimit.dev immediately)";
		}
		res.status(404).send(reason);
	});
});

app.use(function (req, res) {
	res.status(404).end();
});

module.exports = app;
