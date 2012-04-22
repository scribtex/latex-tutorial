var Express = require("express");
var http    = require("http");
var url     = require("url");

var server = Express.createServer();

var mountPoint = "/clsi";

config = {
    clsiUrl : "http://localhost:3002"
}

server.all(mountPoint + "/*", function(req, res, next) {
    var backend = http.createClient(
        url.parse(config.clsiUrl).port,
        url.parse(config.clsiUrl).hostname
    )
    backendUrl = req.url.slice(mountPoint.length);

    var proxyRequest = backend.request(req.method, backendUrl, req.headers);

    proxyRequest.addListener("response", function(proxyResponse) {
        proxyResponse.addListener("data", function(chunk) {
            res.write(chunk, "binary");
        });

        proxyResponse.addListener("end", function() {
            res.end();
        });

        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    });

    req.addListener("data", function(chunk) {
        proxyRequest.write(chunk, "binary");
    });

    req.addListener("end", function() {
        proxyRequest.end();
    });
});

server.use(Express.static(__dirname));

server.listen(8000);
