var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var jsonParser = bodyParser.json();

var User = require('./models/user');
var Message = require('./models/message');
//NodeDocs: The url module provides utilities for URL resolution and parsing.
var url = require('url');
//NodeDocs: The querystring module provides utilities for parsing and formatting URL query strings. 
var queryString = require('querystring');



// Add your API endpoints here

app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(200).json(users);
    });
});


app.get('/users/:userId', function(req, res) {
    User.findById({
        _id: req.params.userId
    }, function(err, user) {
        console.log('my error', err);
        console.log('my user', user);

        if (user == null) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        if (err) {
            res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(user);
    });
});


app.post('/users', jsonParser, function(req, res) {
    console.log(req.body.username)
    User.create({
        username: req.body.username
    }, function(err, user) {
        if (!req.body.username) {
            return res.status(422).json({
                message: 'Missing field: username'
            });
        }
            if (typeof(req.body.username) !== 'string') {
                return res.status(422).json({
                    message: 'Incorrect field type: username'
                });
            };


        if (err) {
            res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.location('/users/' + user._id)
        res.status(201).json({});
    });
});

app.put('/users/:userId', jsonParser, function(req, res) {
            User.findByIdAndUpdate({_id: req.params.userId}, {username: req.body.username}, 
            function(err, user) {
                    if(err) {
                        return res.status(500).json({
                            message: 'Internal Server Error'
                        });
                    }
                    res.status(200).json({});
                   
                   //should create a user if they dont exist.
                   if(!user){
                       User.create({
                           username: req.body.username,
                           _id: req.params.userId
                       });
                   }
                   
            });
                
                    //should reject user without a username
                    if(!req.body.username) {
                        return res.status(422).json({
                            message: 'Missing field: username'
                        });
                    }
                    
                    
                    //should reject non-string usernames
                    if (typeof(req.body.username) !== 'string') {
                        return res.status(422).json({
                            message: 'Incorrect field type: username'
                        });
                    };
                   
});

app.delete('/users/:userId', function(req, res) {
    //should delete a user
    User.findByIdAndRemove(req.params.userId, function(err, user) {
        
        //should 404 on non-existent users
        if (user == null) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
         
        if(err) {
            return res.status(500);
        }
        res.status(200).json({});
        
    });
    
});

/************************MESSAGES*********************/

app.get('/messages', jsonParser, function(req, res) {
    
    // if('from' in req.query)
var reqUrl = req.url;
var query = url.parse(reqUrl).query;
    Message.find(
        queryString.parse(query)
    ).populate('from').populate('to').exec(function(err, messages){
    //console.log(messages);
    //console.log(req.query);
            if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
                 res.json(messages);
    
    });
});

app.post('/messages', jsonParser, function(req, res) {
    console.log(req.body.text);
    //should allow adding a message
    Message.create({
        from: req.body.from,
        to: req.body.to,
        text: req.body.text
    }, function(err, message) {
        
        //should reject messages without text
        if (!req.body.text) {
            return res.status(422).json({
                message: 'Missing field: text'
            });
        }
        //should reject text non-string text
            if (typeof(req.body.text) !== 'string') {
                return res.status(422).json({
                    message: 'Incorrect field type: text'
                });
            }
        //should reject to non-string text    
            if (typeof(req.body.to) !== 'string') {
                return res.status(422).json({
                    message: 'Incorrect field type: to'
                });
            }
        //should reject from non-string text
            if (typeof(req.body.from) !== 'string') {
                return res.status(422).json({
                    message: 'Incorrect field type: from'
                });
            }

        //should reject messages from non-existent user
            if (!req.body.fromId) {
                return res.status(422).json({
                  message: 'Incorrect field value: from'  
                });
            }
            
        //should reject messages from non-existent user
            if (!req.body.toId) {
                return res.status(422).json({
                  message: 'Incorrect field value: to'  
                });
            }
        

        if (err) {
            res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.location('/messages/' + message._id);
        res.status(201).json({});
    });
});






var runServer = function(callback) {
    var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://localhost/sup';
        mongoose.connect(databaseUri).then(function() {
            var port = process.env.PORT || 8080;
                var server = app.listen(port, function() {
                    console.log('Listening on localhost:' + port);
                    if (callback) {
                        callback(server);
                    }
                });
            });
        };




            if (require.main === module) {
                runServer();
            };
            exports.app = app;
            exports.runServer = runServer;
