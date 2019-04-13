const faker = require('faker');
faker.locale = "en";
const _ = require('lodash');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Company = require('./mongoose-models/company');
const Customer = require('./mongoose-models/customer');
const Event  = require('./mongoose-models/event');

const defaultNumberOfCompany = 1;
const defaultNumberOfCustomer = 1000;
const defaultNumberOfEvent = 500;

const eventsNames = ['client_order', 'client_search', 'client_order_cancel', 'reports.key_action_clicked', 'reports.edit_action_clicked'];
var  lastUserId = 0;

module.exports.generateCompanyData  = async function (size = defaultNumberOfCompany) {

    try  {
        for (let i=1;i < size+1; i++){
            let  companyData= {
                "buckets" : [],
                "churned" : true,
                "status" : "active",
                "account" : new ObjectId(),
                "user_id" : i,
                "email" : faker.internet.email(),
                "name" : faker.company.companyName(),
                "signed_up_at" : faker.date.past(),
                "last_request_at" : faker.date.recent(),
                "custom_attributes" : {
                    "entity_type" : faker.company.companyName(),
                    "paid_services" : "",
                    "account_type" : "free",
                    "admin_type" : "owner",
                    "assigned_to_partner" : "no",
                    "restaurant_type" : "single_unit",
                    "language_code" : "en",
                    "before_release" : true,
                    "account_status" : "not_completed",
                    "first_name" : faker.name.firstName(),
                    "last_name" : faker.name.lastName(),
                    "token" : faker.internet.url(),
                    "signup_source" : "google.com",
                    "city" : faker.address.city(),
                    "country" : faker.address.country(),
                    "inputDomain" : faker.internet.domainName(),
                    "cuisines" : faker.company.companyName(),
                },
                "created_at" : faker.date.past(),
                "updated_at" : faker.date.recent(),
                "metrics" : {
                    "people_count" : 1000
                }

            };
           let  _companyData  =  await Company.create(companyData);

          // console.log('companyData', _companyData);
            await module.exports.generateCustomerData(_companyData);
        }
        return true;
    } catch(ex){
        return ex;
    }
};



module.exports.generateCustomerData  = async function (_companyData, size = defaultNumberOfCustomer) {
    try  {
        for (let i=0;i < size; i++){
            let user_id = lastUserId++;
            let  custData= {
                "buckets" : [],
                "user_id" : _.padStart(user_id.toString(), 6, '0'),
                "email" : faker.name.findName(),
                "phone" : faker.phone.phoneNumber(),
                "name" : faker.name.findName(),
                "companies": [_companyData._id],
                "custom_attributes" : {
                    "onboarding1" : true,
                    "onboarding2" :  true,
                    "onboarding3" :  true,
                    "onboarding4" : false,
                    "onboarding5" : true
                },
                "created_at" :  faker.date.past(),
                "updated_at" :  faker.date.recent(),
                "account" : _companyData.account,

            };
            let  _custData  =  await Customer.create(custData);
            //console.log('_custData', _custData);
            await module.exports.generateEventData(_companyData, _custData);
            console.log('Event data added  for customer ', _companyData.user_id, ' ###  ',  i);
        }
        return true;
    } catch(ex){
        return ex;
    }
};



module.exports.generateEventData  = async function (_companyData, _custData, size = defaultNumberOfEvent) {

    try  {
        let  allEventData = [];
        for (let i=0;i <= size; i++){
            let  eventData= {
                "user_id" : _custData.user_id,
                "email" : _custData.email,
                "created_at" : faker.date.past(),
                "name" : eventsNames[randomInt(0,  4)],
                "customer_id" : _custData._id,
                "account" : _custData.account,
                "type" : "customer",
                "submitted_at" : faker.date.recent(),

            };
            allEventData.push(eventData);
           // console.log('_eventData', _eventData);
        }
        await Event.insertMany(allEventData);
        allEventData = undefined;
        return true;
    } catch(ex){
        return ex;
    }
};


function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
}