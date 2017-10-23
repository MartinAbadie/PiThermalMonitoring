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
    socket.on('message', function(message) {
        ds18b20.temperature('28-051684eebbff', function(err, value) {
            socket.emit('message', value);
        });
    });
});

server.listen(8666);

function save_new_temp_value(decimal_value, callback) {
    console.log("INFO : save_new_temp_value called");
    var sql = "INSERT INTO thermal_historic SET decimal_value = " + decimal_value;
    con.query(sql, function(err, result) {
        if(err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
        callback();
    });
}