const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');


var env = process.env.NODE_ENV || "development";
// var config = require(__dirname + "/config.json")[env];


if(config.use_env_variable) {
    var connection = mysql.createConnection(process.env[config.use_env_variable]);
} else {
    var connection = mysql.createConnection(config);
}

const port = process.env.PORT || 3000;
var app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

hbs.registerPartials(`${__dirname}/views/partials`);
app.set('view engine', 'hbs');
app.use(express.static(`${__dirname}/public`));

connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
});

io.on('connection', (socket) => {
    console.log('New user connected');
    socket.on('submitSurvey', (userData) => {
        var match;
        var info = [];        
        var user = [userData.q1, userData.q2, userData.q3, userData.q4, userData.q5, userData.q6, userData.q7, userData.q8, userData.q9, userData.q10];
        return new Promise((res, rej) => {
            connection.query('SELECT * FROM results;', function (err, data) {
                if (err) throw err;
                var tempValue;            
                data.forEach(function (element, index) {
                    info.push({
                        name: element.name,
                        photo: element.photo,
                    });
                    console.log(info);
                    var scores = [element.q1, element.q2, element.q3, element.q4, element.q5, element.q6, element.q7, element.q8, element.q9, element.q10];
                    var value = 0;

                    scores.forEach(function(score, index) {
                        value += Math.abs(user[index] - score);
                    }, this);

                    if (index == 0) tempValue = value++;
                    if (value < tempValue) {
                        tempValue = value;
                        match = index;
                    }
                }, this);
                console.log(match);
                res(info[match]);          
            });
        }).then((results) => {
            connection.query('INSERT INTO results SET ?', userData, (err, row) => {
                if (err) throw err;
            });
            
            socket.emit('surveyResults', results);
        });
    });
});

app.get('/', (req, res) => {
    res.render('home.hbs', {
        title: 'Home'
    });
});

app.get('/survey', (req, res) => {
    connection.query('SELECT * FROM questions;', function (err, data) {
        if (err) throw err;
        res.render('survey.hbs', {
            title: 'Survey',
            questions: data,
            script: '/survey.js'
        });
    });
});

app.get('/api/friends', (req, res) => {
    connection.query('SELECT * FROM results;', function (err, data) {
        if (err) throw err;
        var info = [];
        data.forEach(function (element) {
            info.push({
                name: element.name,
                photo: element.photo,
                scores: [element.q1, element.q2, element.q3, element.q4, element.q5, element.q6, element.q7, element.q8, element.q9, element.q10]
            });
        }, this);
        res.send(info);
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});