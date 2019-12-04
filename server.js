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

app.get("/loadProfile", function (req, res) {
    var html = "";
    var access_token = req.query.access_token;
    request.get({url: "https://api.spotify.com/v1/me", headers: {"Authorization": "Bearer " + access_token}}, function (error, response, body) {
        var data = JSON.parse(body);
        html += '<h2 id="logged_in_statement">User:</h2><img id="profile_image" src="' + data.images[0].url + '"/><h3 id="user_name">' + data.display_name + '</h3>';
        res.send(html);
        res.end();
    });
});

app.get("/grabPlaylists", function (req, res) {
    var html = "";
    var access_token = req.query.access_token;
    request.get({url: "https://api.spotify.com/v1/me", headers: {"Authorization": "Bearer " + access_token}}, function (error, response, body) {
        var data = JSON.parse(body);
        request.get({url: "https://api.spotify.com/v1/users/" + data.id + "/playlists", headers: {"Authorization": "Bearer " + access_token}}, function (error, response, body2) {
            var data2 = JSON.parse(body2);
            for (i=0; i<data2.items.length; i++) {
                console.log(data2.items[i].tracks.href)
                html += '<div class="checkboxes"><input type="checkbox" class="checkbox" value="' + data2.items[i].tracks.href + '"/>  ' + data2.items[i].name + '</div>';
            }
            res.send(html);
            res.end();
        });
    });
});

app.get("/transferOnce", function (req, res) {
    return 0;
});

app.get("/makePlay", function(req,res) {
    var devKey = req.query.devKey;
    var userKey = req.query.userKey;
    console.log("makePlay");
    request.get({
        uri: "https://api.music.apple.com/v1/me/library/playlists",
        headers: {
            "Authorization": "Bearer " + devKey,// HDC data type specific
            "Music-User-Token": userKey
        }
    }, function (error, response, body) {
            console.log(body);
            res.send(response);
    });
});