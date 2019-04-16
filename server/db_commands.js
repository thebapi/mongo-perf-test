
db.companies.getIndexes();
db.customers.getIndexes();
db.events.getIndexes();

db.companies.reIndex();
db.customers.reIndex();
db.events.reIndex();



db.events.createIndex({
    "companies": 1,
    "name": 1,
});

db.populated_company_events.createIndex({
    "companies": 1,
    "event.name": 1,
    "event.count": -1,
},  {background:  true});

db.populated_company_events.createIndex({
    "signed_up_at": -1
},  {background:  true});



db.companies.aggregate([
    {'$match': {'status': 'active'}},
    {
        $lookup: {
            from: "events", // field in the items collection
            as: "event"
        }
    }]);

db.companies.aggregate([
    {'$match': {'status': 'active'}},
    {
        "$sort": {
            "signed_up_at": 1
        }
    },
    {'$project': {'_id': 1, 'name': 1,'signed_up_at':1}},
    {
        $lookup: {
            from: "events", // field in the items collection
            as: "event",
            let: {com_id: "$_id"},
            pipeline: [
                {
                    $match:
                        {
                            $expr:
                                {
                                    $and: [
                                        {$gt: [{$indexOfArray: ["$companies", '$$com_id']}, -1]},
                                        {$eq: ["$name", "reports.key_action_clicked"]},
                                    ]
                                }
                        }
                },
                {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                {'$project': {_id: 0, name: "$_id.name", count: 1}},
            ],
        }
    },
    {'$match': { 'event_count': {'$gte': 0 } }},
    {
        "$facet": {
            "count": [
                {
                    "$count": "total"
                }
            ],
            "companies": [
                {
                    "$skip": 0
                },
                {
                    "$limit": 20
                },
                {
                    "$addFields": {
                        "id": "$_id"
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "name": 1,
                        "signed_up_at": 1
                    }
                }
            ]
        }
    },

    //{ $out : "authors" }
],{allowDiskUse: true,  cursor:{batchSize:  10}}).pretty();





db.companies.aggregate([
    {'$match': {'status': 'active'}},
    {"$sort":
    { "signed_up_at": 1}},
    {'$project': {'_id': 1, 'name': 1,'signed_up_at':1}},
    {
        $lookup: {
            from: "events", // field in the items collection
            as: "event",
            let: {com_id: "$_id"},
            pipeline: [
                {
                    $match:
                        {
                            $expr:
                                {
                                    $and: [
                                        {$gt: [{$indexOfArray: ["$companies", '$$com_id']}, -1]},
                                        {$eq: ["$name", "reports.key_action_clicked"]},
                                    ]
                                }
                        }
                },
                {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                {'$project': {_id: 0, name: "$_id.name", count: 1}},
            ],
        }
    },
    {'$match': {  '$or': [{'event.count':{ exists: false}, 'event.count': {  '$gt': 0} }]}},
    {
        "$facet": {
            "count": [
                {
                    "$count": "total"
                }
            ],
            "companies": [
                {
                    "$skip": 0
                },
                {
                    "$limit": 20
                },
                {
                    "$addFields": {
                        "id": "$_id"
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "name": 1,
                        "signed_up_at": 1
                    }
                }
            ]
        }
    },
    //{ $out : "authors" }
],{allowDiskUse: true,  cursor:{batchSize:  10}}).pretty();



db.companies.aggregate([
    {'$match': {'status': 'active'}},
    {'$project': {'_id': 1, 'name': 1,'signed_up_at':1, 'email': 1}},
    {
        $lookup: {
            from: "events", // field in the items collection
            as: "event",
            let: {com_id: "$_id"},
            pipeline: [
                {
                    $match:
                        {
                            $expr:
                                {
                                    $and: [
                                        {$gt: [{$indexOfArray: ["$companies", '$$com_id']}, -1]},
                                        {$eq: ["$name", "reports.key_action_clicked"]},
                                    ]
                                }
                        }
                },
                {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                {'$project': {_id: 0, name: "$_id.name", count: 1}},
            ],
        }
    },
    {'$project': { '_id':  0, 'company_id': "$_id._id", 'name': 1,  'signed_up_at': 1, 'event': "$event"}},
    //{'$match': { 'event_count': {'$gte': 0 } }},
    { $out : "populated_company_events" },
],{allowDiskUse: true,  cursor:{batchSize:  10}});




db.companies.aggregate(
    [
        {
            "$match": {
                "status": "active"
            }
        },
        {
            "$addFields": {
                "id": "$_id"
            }
        },
        {
            "$lookup": {
                "from": "customers",
                "localField": "_id",
                "foreignField": "companies",
                "as": "customers"
            }
        },
        {
            "$unwind": {
                "path": "$customers",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$addFields": {
                "cust": {
                    "$ifNull": [
                        "$customers",
                        []
                    ]
                }
            }
        },
        {
            "$project": {
                "customers": 0
            }
        },
        {
            "$lookup": {
                "from": "events",
                "localField": "cust._id",
                "foreignField": "customer_id",
                "as": "events"
            }
        },
        {
            "$project": {
                "_id": 1,
                "events": "$events"
            }
        },
        {
            "$unwind": {
                "path": "$events",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$facet": {
                "cond0": [
                    {
                        "$group": {
                            "_id": {
                                "id": "$_id",
                                "name": "$events.name"
                            },
                            "count": {
                                "$sum": {
                                    "$cond": [
                                        {
                                            "$and": [
                                                {
                                                    "$eq": [
                                                        "$events.name",
                                                        "reports.key_action_clicked"
                                                    ]
                                                }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "id": "$_id.id",
                            "name": "$_id.name",
                            "count": 1
                        }
                    },
                    {
                        "$group": {
                            "_id": "$id",
                            "count": {
                                "$sum": {
                                    "$cond": [
                                        {
                                            "$eq": [
                                                "$name",
                                                "reports.key_action_clicked"
                                            ]
                                        },
                                        "$count",
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        "$match": {
                            "count": {
                                "$gt": 0
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "id": "$_id"
                        }
                    }
                ]
            }
        },
        {
            "$project": {
                "ids": {
                    "$setIntersection": [
                        "$cond0"
                    ]
                }
            }
        },
        {
            "$unwind": {
                "path": "$ids",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$replaceRoot": {
                "newRoot": {
                    "$ifNull": [
                        "$ids",
                        {
                            "id": null
                        }
                    ]
                }
            }
        },
        {
            "$lookup": {
                "from": "companies",
                "localField": "id",
                "foreignField": "_id",
                "as": "companies"
            }
        },
        {
            "$project": {
                "_id": 0,
                "companies": "$companies"
            }
        },
        {
            "$unwind": "$companies"
        },
        {
            "$replaceRoot": {
                "newRoot": "$companies"
            }
        },
        {
            "$facet": {
                "count": [
                    {
                        "$count": "total"
                    }
                ],
                "companies": [
                    {
                        "$skip": 0
                    },
                    {
                        "$limit": 20
                    },
                    {
                        "$sort": {
                            "signed_up_at": 1
                        }
                    },
                    {
                        "$addFields": {
                            "id": "$_id"
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "name": 1,
                            "signed_up_at": 1
                        }
                    }
                ]
            }
        },
        {
            "$project": {
                "_id": 0,
                "total": {
                    "$ifNull": [
                        {
                            "$arrayElemAt": [
                                "$count.total",
                                0
                            ]
                        },
                        0
                    ]
                },
                "companies": "$companies"
            }
        }
    ],
    {
        allowDiskUse: true
    }
)



db.companies.aggregate(
    [
        {
            "$match": {
                "status": "active"
            }
        },
        {
            "$addFields": {
                "id": "$_id"
            }
        },
        {
            "$lookup": {
                "from": "customers",
                "localField": "_id",
                "foreignField": "companies",
                "as": "customers"
            }
        },
        {
            "$unwind": {
                "path": "$customers",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$addFields": {
                "cust": {
                    "$ifNull": [
                        "$customers",
                        []
                    ]
                }
            }
        },
        {
            "$project": {
                "customers": 0
            }
        },
        {
            "$lookup": {
                "from": "events",
                "localField": "cust._id",
                "foreignField": "customer_id",
                "as": "events"
            }
        },
        {
            "$project": {
                "_id": 1,
                "events": "$events"
            }
        },
        {
            "$unwind": {
                "path": "$events",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$facet": {
                "cond0": [
                    {
                        "$group": {
                            "_id": {
                                "id": "$_id",
                                "name": "$events.name"
                            },
                            "count": {
                                "$sum": {
                                    "$cond": [
                                        {
                                            "$and": [
                                                {
                                                    "$eq": [
                                                        "$events.name",
                                                        "reports.key_action_clicked"
                                                    ]
                                                }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "id": "$_id.id",
                            "name": "$_id.name",
                            "count": 1
                        }
                    },
                    {
                        "$group": {
                            "_id": "$id",
                            "count": {
                                "$sum": {
                                    "$cond": [
                                        {
                                            "$eq": [
                                                "$name",
                                                "reports.key_action_clicked"
                                            ]
                                        },
                                        "$count",
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        "$match": {
                            "count": {
                                "$gt": 0
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "id": "$_id"
                        }
                    }
                ]
            }
        },
        {
            "$project": {
                "ids": {
                    "$setIntersection": [
                        "$cond0"
                    ]
                }
            }
        },
        {
            "$unwind": {
                "path": "$ids",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$replaceRoot": {
                "newRoot": {
                    "$ifNull": [
                        "$ids",
                        {
                            "id": null
                        }
                    ]
                }
            }
        },
        {
            "$lookup": {
                "from": "companies",
                "localField": "id",
                "foreignField": "_id",
                "as": "companies"
            }
        },
        {
            "$project": {
                "_id": 0,
                "companies": "$companies"
            }
        },
        {
            "$unwind": "$companies"
        },
        {
            "$replaceRoot": {
                "newRoot": "$companies"
            }
        },
        {
            "$facet": {
                "count": [
                    {
                        "$count": "total"
                    }
                ],
                "companies": [
                    {
                        "$skip": 0
                    },
                    {
                        "$limit": 20
                    },
                    {
                        "$sort": {
                            "signed_up_at": 1
                        }
                    },
                    {
                        "$addFields": {
                            "id": "$_id"
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "name": 1,
                            "signed_up_at": 1
                        }
                    }
                ]
            }
        },
        {
            "$project": {
                "_id": 0,
                "total": {
                    "$ifNull": [
                        {
                            "$arrayElemAt": [
                                "$count.total",
                                0
                            ]
                        },
                        0
                    ]
                },
                "companies": "$companies"
            }
        }
    ],
    {
        allowDiskUse: true
    }
)