var databse_config = require('./database-config.json');
var ds18b20 = require('ds18b20');
var io = require('socket.io');
var mysql = require('mysql');
var http = require('http');
var fs = require('fs');

// Create MySQL connection with data contained in database-config.json file
let con = mysql.createConnection({
    host: databse_config.host,
    user: databse_config.user,
    password: databse_config.password,
    database: databse_config.database
});

var server = http.createServer(function(req, res) {
    res.end('Hello');
});
io = io.listen(server);

io.sockets.on('connection', function(socket) {
    console.log('New connection');
    setInterval(function() {
        ds18b20.temperature('28-051684eebbff', function(err, value) {
            socket.emit('message', value);
        });
    }, 100);
});

/*
io.sockets.on('connection', function(socket) {
    console.log('New connection');
    ds18b20.temperature('28-051684eebbff', function(err, value) {
        socket.emit('message', value);
    });
});
*/

server.listen(8666);

/*
function(req, res) {
    ds18b20.temperature('28-051684eebbff', function(err, value) {
        console.log("INFO : callback ds18b20 with value " + value);
        save_new_temp_value(value, function() {
            res.writeHead(200, {'Content-type':'text/html'});
            res.write(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>PiThermalMonitoring</title>
                    <style>
                        .temp {
                            font-family: Verdana, Geneva, sans-serif;
                            text-align: center;
                            margin-top: 50vh;
                            transform: translateY(-50%);
                        }
                    </style>
                </head>
                <body>
                    <div class="temp">
                        ` + value + `°C
                    </div>
                </body>
            </html>
                `);
            res.end();
        });
    });
});
*/


//server.listen(8666);

function save_new_temp_value(decimal_value, callback) {
    console.log("INFO : save_new_temp_value called");
    var sql = "INSERT INTO thermal_historic SET decimal_value = " + decimal_value;
    con.query(sql, function(err, result) {
        if(err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
        callback();
    });
    /*
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "INSERT INTO thermal_historic SET decimal_value = " + decimal_value;
        console.log(sql);
        con.query(sql, function(err, result) {
            if(err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
    });
    */
}