const mongoose = require('mongoose');
const schema = mongoose.Schema;
const ObjectId = schema.Types.ObjectId;
// Use to log any action in the system, so we can track thing
const customerSchema = new mongoose.Schema({
    "buckets" : [{ type: ObjectId} ],
    "user_id" :{ type: String, index: true},
    "email" : { type: String, index: true },
    "phone" : { type: String },
    "name" : { type: String },
    "companies": [{type: ObjectId, ref: 'company'}],
    "custom_attributes" : {
        "onboarding1" :  { type: Boolean },
        "onboarding2" :  { type: Boolean },
        "onboarding3" :  { type: Boolean },
        "onboarding4" : { type: Boolean },
        "onboarding5" :  { type: Boolean }
    },
    "created_at" :  { type: Date },
    "updated_at" :  { type: Date },
    "account" : { type: ObjectId, index: true }
});


const Customer = mongoose.model('customer', customerSchema);
module.exports = Customer;