const query1 = ``;

db.companies.getIndexes();
db.customers.getIndexes();
db.events.getIndexes();

db.customers.reIndex();
db.events.reIndex();


db.events.createIndex({
    "name": 1,
    "customer_id": 1
}, {

    "name": "name_1_cust_1",
    "background": true
});

db.customers.reIndex();
db.events.reIndex();


db.orders.insert([
    {"_id": 1, "item": "almonds", "price": 12, "quantity": 2},
    {"_id": 2, "item": "pecans", "price": 20, "quantity": 1}
]);


db.items.insert([
    {"_id": 1, "item_id": "almonds", description: "almond clusters", "instock": 120},
    {"_id": 2, "item_id": "bread", description: "raisin and nut bread", "instock": 80},
    {"_id": 3, "item_id": "pecans", description: "candied pecans", "instock": 60}
]);

db.orders.aggregate([
    {
        $lookup: {
            from: "items",
            localField: "item_id",    // field in the orders collection
            foreignField: "item",  // field in the items collection
            as: "fromItems"
        }
    },
    {$project: {fromItems: 0}}
]);
db.customers.reIndex();
db.events.reIndex();

db.items.aggregate([
    {'$match': {'item_id': 'almonds'}},
    {
        $lookup: {
            from: "orders",
            localField: "item",    // field in the orders collection
            foreignField: "item_id",  // field in the items collection
            as: "fromItems"
        }
    }
]);


db.customers.aggregate([
    {
        $lookup: {
            from: "events", // field in the items collection
            as: "events",
            let: {cus_id: "$_id"},
            pipeline: [
                {
                    $match:
                        {
                            $expr:
                                {
                                    $and:
                                        [
                                            {$eq: ["$customer_id", "$$cus_id"]},
                                            {$eq: ["$name", "reports.key_action_clicked"]},
                                        ]
                                }
                        }
                },
                {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                {"$sort": {'count': -1}},
                {'$project': {_id: 0, name: "$_id.name", count: 1}}
            ],
        }
    },
    {'$project': {'name': 1, 'email': 1, 'events': 1}}
]).pretty();

db.companies.aggregate([
    {'$match': {'status': 'active'} },
    {'$project': {'_id': 1, 'company_account': '$account' }},
    {
        $lookup: {
            from: "customers", // field in the items collection
            as: "customers",
            let: {com_id: "$_id"},
            pipeline: [{
                $match:
                    {
                        $expr: {
                            $and:
                                [
                                    { $eq: ["$companies", ["$$com_id"]]},
                                ]
                        }
                    }
            }
                //{'$project': {_id: 1}}
            ],
        }
    }
]).pretty();

db.companies.aggregate([
    {'$match': {'status': 'active'}}
]).pretty();


db.customers.aggregate([
    {
        $lookup: {
            from: "events", // field in the items collection
            as: "events",
            let: {cus_id: "$_id"},
            pipeline: [
                {
                    $match:
                        {
                            $expr:
                                {
                                    $and:
                                        [
                                            {$eq: ["$customer_id", "$$cus_id"]},
                                        ]
                                }
                        }
                },
                {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                {"$sort": {'count': -1}},
                {'$project': {_id: 0, name: "$_id.name", count: 1}}
            ],
        }
    },
    {'$project': {'name': 1, 'email': 1, 'events': 1}}
]).pretty();


db.companies.aggregate([
    {'$match': {'status': 'active'} },
    {'$project': {'_id': 1, 'company_account': '$account' }},
    {
        $lookup: {
            from: "customers", // field in the items collection
            as: "customers",
            let: {com_id: "$_id"},
            pipeline: [{
                $match:
                    {
                        $expr: {
                            $and:
                                [
                                    { $eq: ["$companies", ["$$com_id"]]},
                                ]
                        }
                    }
            }, {
                    $lookup: {
                        from: "events", // field in the items collection
                        as: "fromItems",
                        let: {cus_id: "$_id"},
                        pipeline: [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        {$eq: ["$customer_id", "$$cus_id"]},
                                                    ]
                                            }
                                    }
                            },
                            {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                        ],
                    }
                }
            ]}
    }
]).pretty();



db.companies.aggregate([
    {'$match': {'status': 'active'} },
    {'$project': {'_id': 1, 'company_account': '$account' }},
    {
        $lookup: {
            from: "customers", // field in the items collection
            as: "customer",
            let: {com_id: "$_id"},
            pipeline: [{
                $match:
                    {
                        $expr: {
                            $and:
                                [
                                    { $eq: ["$companies", ["$$com_id"]]},
                                ]
                        }
                    }
            }
            ]}
    },
    {
        "$unwind": {
            "path": "$customer",
            "preserveNullAndEmptyArrays": true
        }
    },{
        $lookup: {
            from: "events", // field in the items collection
            as: "events",
            let: {cus_id: "$customer._id"},
            pipeline: [
                {
                    $match:
                        {
                            $expr:
                                {
                                    $and:
                                        [
                                            {$eq: ["$customer_id", "$$cus_id"]},
                                        ]
                                }
                        }
                }
            ],
        }
}
]).pretty();

db.customers.aggregate([
    {'$match': {'_id': ObjectId('5cafab30d5591770743eb163')}},
    {
        $lookup: {
            from: "events", // field in the items collection
            as: "fromItems",
            let: {cus_id: "$_id"},
            pipeline: [
                {
                    $match:
                        {
                            $expr:
                                {
                                    $and:
                                        [
                                            {$eq: ["$customer_id", "$$cus_id"]},
                                            {$eq: ["$name", "reports.key_action_clicked"]},
                                        ]
                                }
                        }
                },
                {"$group": {"_id": {"name": "$name"}, "count": {"$sum": 1}}},
                {$project: {_id: 0}}
            ],
        }
    }
]).pretty();


db.customers.aggregate([
    {'$match': {'_id': ObjectId('5cafab30d5591770743eb163')}}
]);

db.customers.aggregate([
    {'$match': {$expr: {'_id': ObjectId('5cafab30d5591770743eb163')}}},
    {
        $lookup: {
            from: "events",
            localField: "customer_id",    // field in the orders collection
            foreignField: "_id",  // field in the items collection
            as: "fromItems",

        }
    },
]);

db.customers.aggregate([
    {
        "$lookup": {
            "from": "events",
            "localField": "customer_id",
            "foreignField": "_id",
            "as": "eventsitems"
        }
    }]);

{
    $lookup: {
        "from"
    :
        "events",
            "localField"
    :
        "_id",
            "foreignField"
    :
        "customer_id",
            "as"
    :
        "events"
    }
    db.events.aggregate([{
        '$match': {
            'name': 'reports.key_action_clicked',
            'account': ObjectId('5cb029f5f1b60c8133e1e4b4'),
        }
    }, {"$group": {"_id": {"name": "$name", "customer_id": "$customer_id"}, "count": {"$sum": 1}}}, {
        "$project": {
            "_id": 0,
            "customer_id": "$_id.customer_id",
            "count": 1
        }
    }, {"$sort": {'count': -1}}], {explain: true, hint: {name: 1, account: 1}})


    db.events.aggregate([{
        '$match': {
            'name': 'reports.key_action_clicked',
            'account': ObjectId('5cb029f5f1b60c8133e1e4b4'),
        }
    }, {"$group": {"_id": {"name": "$name", "customer_id": "$customer_id"}, "count": {"$sum": 1}}}, {
        "$project": {
            "_id": 0,
            "customer_id": "$_id.customer_id",
            "count": 1
        }
    }, {"$sort": {'count': -1}}], {hint: {name: 1, account: 1}})


    db.events.aggregate([{
        '$match': {
            "customer_id": ObjectId("5cb029f5f1b60c8133e1e4b4"),
            'name': 'reports.key_action_clicked',
            'account': ObjectId('5cb029f5f1b60c8133e1e4b4'),
        }
    }, {"$group": {"_id": "name", "count": {"$sum": 1}}}, {
        "$project": {
            "_id": 1,
            "id": "$_id.id",
            "name": "$_id.name",
            "count": 1
        }
    }])


    db.companies.aggregate(
        [
            {
                "$match": {
                    "$and": [
                        {
                            "account": ObjectId("5cafab30d5591770743eb161")
                        }
                    ]
                }
            },
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