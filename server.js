var express = require( "express" );
var request = require( "request" );
var buffer = require( "buffer" );
var cors = require("cors");
const fs      = require("fs");
const jwt     = require("jsonwebtoken");
var spotify_data = require( "./spotify.json" );
var mysql = require('mysql');
var ID ='test';
var profileLink = 'testlink'
var profilePic = 'testpic'
var key = require('./dbkey.json');

var app = express();

var con = mysql.createConnection({
    host: 'swapify.mysql.database.azure.com',
    user: key.user,
    password: key.password,
    database: 'swapify',
    port: 3306,
    ssl: true
    });

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
        if (data.images[0]) {
            html += '<h2 id="logged_in_statement">User:</h2><img id="profile_image" src="' + data.images[0].url + '"/><h3 id="user_name">' + data.display_name + '</h3>'
        } else {
            html += '<h2 id="logged_in_statement">User:</h2><h4 id="profile_image"/>No Profile Picture Found</p><h4 id="user_name">' + data.display_name + '</h3>';
        }
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
                html += '<div class="checkboxes" onclick="transferSelected(\'' + data2.items[i].tracks.href + '\')" id="' + data2.items[i].tracks.href + '" name="' + data2.items[i].name + '"/>  ' + data2.items[i].name + '</div>';
            }
            res.send(html);
            res.end();
        });
    });
});

app.get("/transferOnce", function (req, res) {
    var access_token = req.query.access_token;
    var base_uri = req.query.uri;
    var playlist_id = base_uri.split("/").pop();
    console.log(playlist_id);
    request.get({
        uri: "https://api.spotify.com/v1/playlists/" + playlist_id,
        headers: {
            "Authorization:": "Bearer " + access_token
        }
    }, function (error, resopnse, body) {
        var data = JSON.parse(body);
        console.log(data);
    });
});

app.get("/makePlay", function(req,res) {
    var devKey = req.query.devKey;
    var userKey = req.query.userKey;
    request.get({
        uri: "https://api.music.apple.com/v1/me/library/playlists",
        headers: {
            "Authorization": "Bearer " + devKey,// HDC data type specific
            "Music-User-Token": userKey
        }
    }, function (error, response, body) {
            res.send(response);
    });
});


app.post("/transferSelected", function(req,res) {
    var playlist_name = req.query.playlist_name;
    var playlist = req.query.playlist;
    var access_token = req.query.access_token;
    var new_array = [];
    request.get({
        uri: playlist,
        headers: {"Authorization": "Bearer " + access_token}
    }, function (error, response, body) {
            var data = JSON.parse(body);
            var playlist_tracks = []
            for (j=0; j<data.items.length; j++) {
                    //console.log(data.items[j].track.name + " " + data.items[j].track.artists[0].name);
                playlist_tracks.push(data.items[j].track.name + " " + data.items[j].track.artists[0].name);
            }
            new_array.push(playlist_tracks);
            res.send({"song_array": new_array, "playlist_name": playlist_name});
            }
    )
});

con.connect(
    function(err){
        if(err){
            console.log("Error Connecting to Swapify DB.");
        }
        else{
            console.log("Successful connection to Swapify DB.")
        }
    });

//TO DO: Save user info/init user (ID, Profile Link, #Swaps)

exports.updateUser = function (ID, profileLink, profilePic){
    con.query(`INSERT IGNORE INTO Curators (curatorID, profileLink, profilePic, swapCount) VALUES ("${ID}", "${profileLink}", "${profilePic}", 0);`,
               function(err, results, fields){
                    if(err) throw err;
                    else console.log('Updated ' + results.affectedRows + 'row(s).');
    })

    con.query(`UPDATE Curators SET swapCount = swapCount + 1 WHERE curatorID = "${ID}";`,
               function(err, results, fields){
                    if(err) throw err;
                    else console.log('Updated ' + results.affectedRows + 'row(s).');
    })

};

//TO DO: Save swapped playlist info (Playlist Name, Curator, Transfer Count)

exports.updatePlaylists = function (title, curator){
    con.query(`INSERT IGNORE INTO Playlists (title, curatorID, transferCount) VALUES ("${title}", "${curator}", 0);`,
               function(err, results, fields){
                    if(err) throw err;
                    else console.log('Updated ' + results.affectedRows + 'row(s).');
    })

    con.query(`UPDATE Playlists SET transferCount = transferCount + 1 WHERE title = "${title}";`,
               function(err, results, fields){
                    if(err) throw err;
                    else console.log('Updated ' + results.affectedRows + 'row(s).');
    })
};

//TO DO: Pull top 5 transferred playlists

exports.showTopPlaylists = function(){
    con.query(`SELECT title FROM Playlists ORDER BY DESC LIMIT 0,5;`,
             function(err, results, fields){
                    if(err) throw err;
                    else console.log('Returning Popular Playlists...' + results);
        return results;
    })
};

//TO DO: Pull top 5 frequent users

exports.showFrequentUsers = function(){
        con.query(`SELECT curatorID FROM Curators ORDER BY DESC LIMIT 0,5;`,
             function(err, results, fields){
                    if(err) throw err;
                    else console.log('Returning frequent users...' + results);
            return results;
    })
};

//TO DO: Pull a random playlist

exports.feelingLucky = function() {
   idx = Math.floor((Math.random() * 2) + 1);
            con.query(`SELECT title FROM Playlists ORDER BY DESC LIMIT ${idx},1;`,
             function(err, results, fields){
                    if(err) throw err;
                    else console.log('Feeling Lucky?: ' + results);
            return results;
    })
}