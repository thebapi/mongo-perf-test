
db.companies.getIndexes();
db.customers.getIndexes();
db.events.getIndexes();


db.customers.reIndex();



db.companies.reIndex();

db.events.reIndex();



db.events.createIndex({
    "company": 1,
    "name": 1,
});


db.aggregatedcollection.createIndex({
    "company_id" : 1,
        "event_name" : 1,
        "event_count" : 1
}, { background:true});



db.companies.aggregate([
    {'$match': {'status': 'active'}},
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
                                        {$eq:  ["$company", '$$com_id']},
                                    ]
                                }
                        }
                },
                {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                {'$project': {_id: 0, name: "$_id.name", count: 1}},
            ],

        },
    },
    {'$unwind': '$event'},
    {'$project': {'_id': 0, 'company_id': '$_id', 'name': 1,'signed_up_at':1, 'event_count': '$event.count', 'event_name': '$event.name'}},
    {'$out':  'aggregatedcollection'}
]);



db.companies.aggregate([
    {'$match': {'status': 'active'}},
    {
        $lookup: {
            from: "events", // field in the items collection
            as: "event",
            "localField": "id",
            "foreignField": "company",
        }
    }]).pretty();

  db.companies.aggregate([
        {'$match': {'status': 'active'}},
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
                                            {$eq:  ["$company", '$$com_id']},
                                            {$eq: ["$name", "reports.key_action_clicked"]},
                                        ]
                                    }
                            }
                    },
                    {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                    {'$project': {_id: 0, name: "$_id.name", count: 1}},
                ],

            },
        }]).pretty();


db.companies.aggregate([
        {'$match': {'status': 'active'}},
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
                                            {$eq:  ["$company", '$$com_id']},
                                            {$eq: ["$name", "reports.key_action_clicked"]},
                                        ]
                                    }
                            }
                    },
                    {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                    {'$project': {_id: 0, name: "$_id.name", count: 1}},
                ],

            },

        },{ "$facet": {
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
            }}]).pretty();