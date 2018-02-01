var databse_config = require('./database-config.json');
var ds18b20 = require('ds18b20');
var io = require('socket.io');
var mysql = require('mysql');
var http = require('http');
var fs = require('fs');
var speedTest = require('speedtest-net');

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
    let max_speed = 0;
    let test = speedTest({maxTime: 6000});
    socket.on('message', function(message) {
        if (message === "temp?") {
            ds18b20.temperature('28-051684eebbff', function(err, value) {
                tmp = { type: 'temp', value: value };
                socket.emit('message', tmp);
            });
        } else if (message === "speed?") {
            test.on('downloadspeedprogress', speed => {
                value = (speed * 0.125).toFixed(2);
                if(parseFloat(value) > parseFloat(max_speed)) {
                    // console.log(value);
                    max_speed = value;
                }
                console.log('New values : ' + value + ' Max Speed : ' + max_speed);
                tmp = { type: 'speed', value: value };
                socket.emit('message', tmp);
            });
            test.on('done', dataOverload => {
                // console.dir(data);
                tmp = { type: 'speed', value: 'finish' };
                socket.emit('message', tmp);

                tmp = { type: 'speed', value: max_speed };
                socket.emit('message', tmp);
                console.log('Max speed : ' + max_speed + 'Mo/s');
            });
        }
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