const mongoose = require('mongoose');
const schema = mongoose.Schema;
const ObjectId = schema.Types.ObjectId;
// Use to log any action in the system, so we can track thing
const companySchema = new mongoose.Schema({
    "buckets" : [{ type: ObjectId} ],
    "churned" : { type: Boolean },
    "status" : { type: String, index: true },
    "account" : { type: ObjectId, index: true},
    "user_id" : { type: String},
    "email" : { type: String },
    "name" : { type: String },
    "signed_up_at" : { type: Date },
    "last_request_at" : { type: Date },
    "custom_attributes" : {
        "entity_type" : { type: String },
        "paid_services" : { type: String },
        "account_type" : { type: String },
        "admin_type" : { type: String },
        "assigned_to_partner" : { type: String },
        "restaurant_type" : { type: String },
        "language_code" : { type: String },
        "before_release" : { type: Boolean },
        "account_status" : { type: String },
        "first_name" : { type: String },
        "last_name" : { type: String },
        "token" : { type: String },
        "signup_source" : { type: String },
        "city" : { type: String },
        "country" : { type: String },
        "inputDomain" : { type: String },
        "cuisines" : { type: String }
    },
    "created_at" : { type: Date },
    "metrics" : {
        "people_count" : Number
    }
});

const Company = mongoose.model('company', companySchema);
module.exports = Company;