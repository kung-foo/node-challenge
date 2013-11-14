var express = require('express');
var app = express();

// https://github.com/mikeal/request
var request = require('request');

// https://github.com/caolan/async
var async = require('async');

// http://momentjs.com/docs/
var moment = require('moment');

// setup our route
app.get('/', function(req, res) {
    // starting date
    var now = moment.utc();

    // output dict to collect jokes by date
    var output = {};

    // array of tasks to execute in parallel
    var tasks = [];

    // get jokes for the last seven days
    for (var i = 0; i < 7; i++) {
        // clone date since subtract() modifies the source
        var d = now.clone().subtract('days', i);

        // create a new anonymous task function
        // callback parameter is passed in from async
        tasks.push(function(callback) {
            // yay for rest APIs!
            request('http://api.icndb.com/jokes/random?exclude=[explicit]', function(error, response, body) {
                if (!error) {
                    // store joke based on date
                    output[d.format('YYYYMMDD')] = JSON.parse(body).value.joke;
                }
                // required to return from async.parallelLimit
                callback(error);
            });
        });

    }

    // run! set limit to 1 to be nice to the joke server
    async.parallelLimit(tasks, 1, function(err, results) {
        if (err) {
            res.send(500, err);
        }
        else {
            res.send(200, output);
        }
    });
});

// start server
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0");
