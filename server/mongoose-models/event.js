const mongoose = require('mongoose');
const schema = mongoose.Schema;
const ObjectId = schema.Types.ObjectId;
// Use to log any action in the system, so we can track thing
const eventSchema = new mongoose.Schema({
    "user_id" : { type: String},
    "email" : { type: String },
    "created_at" : { type: Date },
    "name" : { type: String },
    "customer_id" :{ type: ObjectId},
    "account" : { type: ObjectId },
    "company" : {type: ObjectId,  ref: 'company'},
    "type" : { type: String },
    "submitted_at" : { type: Date },
});

//eventSchema.index({'companies': 1, name: 1});
eventSchema.index({'company': 1,  name: 1},{ background: true, sparse: true});
const Event = mongoose.model('event', eventSchema);
module.exports = Event;





