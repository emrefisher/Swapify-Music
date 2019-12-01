var express = require( "express" );
var request = require( "request" );
var buffer = require( "buffer" );
var cors = require("cors");
const fs      = require("fs");
const jwt     = require("jsonwebtoken");
var spotify_data = require( "./spotify.json" );

var app = express();

app.use( express.static("public")).use(cors());

app.listen(8080, () => {
    console.log("Server listening on port 8080");
});

app.get("/", function (req, res) {

});
app.get("/redirect", function (req, res) {

    var CLIENT_SECRET = spotify_data.client_secret;
    var CLIENT_ID = spotify_data.client_id;
    var access_code = req.query.code;

    request.post({
        uri: "https://accounts.spotify.com/api/token",
        form: {
            code: access_code,
            grant_type: "authorization_code",
            client_secret: CLIENT_SECRET,
            client_id: CLIENT_ID,
            redirect_uri: "http://localhost:8080/redirect"
        }
    }, function (error, response, body) {
        if (error) {
            console.log("Error: " + error);
        } else {
            var data = JSON.parse(body);
            res.redirect("/?access_token=" + data.access_token);
        }
    });
});

app.get("/logInApple", function (req, res) {

    const privateKey = fs.readFileSync("./AuthKey_9655XXK2TC.p8").toString();
    const teamId     = "38UN2K8879";
    const keyId      = "9655XXK2TC";

    const jwtToken = jwt.sign({}, privateKey, {
        algorithm: "ES256",
        expiresIn: "180d",
        issuer: teamId,
        header: {
            alg: "ES256",
            kid: keyId
        }
        });

        console.log(jwtToken);
        });