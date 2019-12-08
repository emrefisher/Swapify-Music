var express = require( "express" );
var app = express();
var mysql = require('mysql');
var ID ='test';
var profileLink = 'testlink'
var profilePic = 'testpic'
var key = require('./dbkey.json');

var con = mysql.createConnection({
    host: 'swapify.mysql.database.azure.com',
    user: key.user,
    password: key.password,
    database: 'swapify',
    port: 3306,
    ssl: true
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