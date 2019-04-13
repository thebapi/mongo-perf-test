require('dotenv').config();
const stackTrace = require('stack-trace');

const mongooseModels = require('./server/mongoose-models');
const generator = require('./server/generator');

module.exports.create = function(data) {
    return new Promise(function(resolve, reject) {
        data.created_at = new Date();
        notificationLogModel
            .create(data)
            .then(results => {
                resolve(results);
            })
            .catch(err => reject(err));
    });
};



mongooseModels.initiate().then(async ()=>{
    console.log("Weldone");
    await generator.generateCompanyData();
    console.log('All Data generation done');
});



process.on('uncaughtException', function(err) {
    console.log('Caught exception: ');
    let trace = stackTrace.parse(err);
    if (err.getStack) {
        console.log(err.getStack());
    } else {
        console.log(err);
    }
    process.exit(1);
});

process.on('unhandledRejection', function(err) {
    console.log('Caught unhandledRejection: ');
    let trace = stackTrace.parse(err);
    if (err.getStack) {
        console.log(err.getStack());
    } else {
        console.log('unhandledRejection: ', err);
    }
    console.log(err);
    // process.exit(1);
});