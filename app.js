var express = require('express');
var fs = require("fs")
var app = express();
app.use(express.json());
// view engine setup

app.get("/check", async (req, res) => {
  let data = JSON.parse(fs.readFileSync('./domains.json'));
  if(data.indexOf(req.query.domain) >= 0) {
    res.status(200).end();
  } else {
    res.status(404).end();
  }
})
app.post("/add", async (req, res) => {
  let data = JSON.parse(fs.readFileSync('./domains.json'));
  let linkRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  let httpRegex = /https?:\/\//;
  let pathRegex = /[a-z 0-9 -]\/{1}.*/;
  let characterRegex = /[^a-zA-Z 0-9 - . / : ]/g;
  console.log(req.body);
  if(req.body.domain && req.body.domain.length < 100) {
    console.log("domain exists and is short enough");
    let link = req.body.domain;
    link = link.replace(characterRegex, "");
    if(linkRegex.test(req.body.domain)) {
      console.log("is link");
      if(httpRegex.test(link)) {
        link.replace(httpRegex, "");
        console.log("http found");
      }
      if(pathRegex.test(link)) {
        link = link.substr(0, link.indexOf("/"));
        console.log("path found");
      }
      console.log("running fetch");
      let dns = await (await fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${link}`, {headers:{"Origin": "https://api-ninjas.com"}})).json();
      console.log("fetch completed");
      if(dns[0]) {
        console.log("data found");
        if(dns[0].record_type == "A") {
          console.log("dns[0] is a record");
          if(dns[0].value == "5.161.118.69") {
            console.log("correct domain");
            data.push(link);
            fs.writeFileSync("./domains.json", JSON.stringify(data));
            res.status(200).end();
            return;
          }
        }
      }
    }
  }
  res.status(404).end();
})

app.use(function(req, res) {
  res.status(404).end();
});

module.exports = app;