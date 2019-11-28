var express = require( "express" );
var request = require( "request" );
var buffer = require( "buffer" );
var cors = require("cors");
var spotify_data = require( "./spotify.json" );

var app = express();

app.use( express.static("public")).use(cors());

app.listen(8080, () => {
    console.log("Server listening on port 8080");
});

app.get("/", function (req, res) {

});
app.get("/redirect", function (req, res) {

    CLIENT_SECRET = spotify_data.client_secret;
    CLIENT_ID = spotify_data.client_id;
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

