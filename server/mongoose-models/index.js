/* eslint-disable no-process-exit */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoConnString = process.env.MONGO_URL;
const fs = require('fs');
const async = require('neo-async');

var connection;
//Needed to get the list of models
function bootModelFiles() {
    var files = fs.readdirSync(__dirname);
    files.forEach(file => {
        if (file.indexOf('.js') > -1) {
            require(__dirname + '/' + file);
        }
    });
}

mongoose.set('debug', false);

mongoose.Promise = Promise;

const options = {
    autoReconnect: true,
    poolSize: 10,
    autoIndex: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 200,
    useNewUrlParser: true,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000,
    family: 4,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
};
/*

module.exports.initiate = function() {
    mongoose
        .connect(
            mongoConnString,
            options,
        )
        .then(
            connection => {
                console.log('Mongoose connected!');
                bootModelFiles();
                process.on('SIGINT', function(err) {
                    //1=connected, 2=connecting
                    if (
                        connection &&
                        (connection.readyState === 1 ||
                            connection.readyState === 2)
                    ) {
                        connection.onClose(true);
                    }
                    process.exit();
                });
            },
            error => {
                console.log('Mongoose connection error ', error);
            },
        );
};

*/

module.exports.initiate = async function() {

   return new  Promise((resolve,  reject)=>{
       async.retry(
           { times: 100, interval: 1000 },
           function(callback) {
               mongoose
                   .connect(
                       mongoConnString,
                       options,
                   )
                   .then(_connection => {
                       connection = _connection;
                       callback(null);
                   })
                   .catch(err => {
                       console.log('Mongoose waiting for connection.');
                       callback(err);
                   });
           },
           function(err) {
               if (err) {
                   console.error('Giving up for mongo', err);
                   reject(err);
               } else {
                   console.log('Mongoose connection successfull.');
                   bootModelFiles();
                   resolve();
               }
           },
       );
   });

};

