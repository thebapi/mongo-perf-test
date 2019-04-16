const mongoose = require('mongoose');
const schema = mongoose.Schema;
const ObjectId = schema.Types.ObjectId;
// Use to log any action in the system, so we can track thing
const eventSchema = new mongoose.Schema({
    "user_id" : { type: String},
    "email" : { type: String },
    "created_at" : { type: Date },
    "name" : { type: String, index: true },
    "customer_id" :{ type: ObjectId, ref: 'customer' },
    "account" : { type: ObjectId },
    "companies" : [{ type: ObjectId,  ref: 'company', index: true }],
    "type" : { type: String },
    "submitted_at" : { type: Date },
});

eventSchema.index({'companies': 1, name: 1});
eventSchema.index({name: 1, customer_id: 1});

const Event = mongoose.model('event', eventSchema);
module.exports = Event;





