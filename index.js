var databse_config = require('./database-config.json');
var ds18b20 = require('ds18b20');
var mysql = require('mysql');
var http = require('http');
var fs = require('fs');

// Create MySQL connection with data contained in database-config.json file
let con = mysql.createConnection({
    host: databse_config.host,
    user: databse_config.user,
    password: databse_config.password
});

http.createServer(function(req, res) {
    ds18b20.temperature('28-051684eebbff', function(err, value) {
        save_new_temp_value(value);
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
}).listen(8666);

function save_new_temp_value(decimal_value) {
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "INSERT INTO thermal_historic decimal_value = " + decimal_value;
        con.query(sql, function(err, result) {
            if(err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
    });
}