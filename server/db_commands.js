
db.companies.getIndexes();
db.customers.getIndexes();
db.events.getIndexes();

db.companies.reIndex();
db.events.reIndex();


db.events.createIndex({
    "company_id": 1,
    "name": 1,
});

db.customers.reIndex();
db.events.reIndex();

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
                                        {$eq: ["$company_id", "$$com_id"]},
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
    {'$project': {'name': 1, 'email': 1,  'signed_up_at': 1, 'event_count': '$event.count', 'event_name': '$event.name'}},
    {'$match': { 'event': {'event_count': {'$gte': 0 } }}},
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
                                        {$eq: ["$company_id", "$$com_id"]},
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
    {'$project': {'name': 1, 'email': 1,  'signed_up_at': 1, 'event_count': '$event.count', 'event_name': '$event.name'}},
    {'$match': { 'event': {'event_count': { '$or': [{'$exists': false, '$lt': 10 }]}}}},
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

    //{ $out : "authors" }
],{allowDiskUse: true,  cursor:{batchSize:  10}}).pretty();