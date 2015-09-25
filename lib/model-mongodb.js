"use strict";

var Promise = require('bluebird');
var mongojs = require('mongojs');

Promise.promisifyAll([
   require("mongojs/lib/collection"),
   require("mongojs/lib/database"),
   require("mongojs/lib/cursor")
]);

module.exports = function(config) {
    var url = config.mongodb.url;
    var collectionName = config.mongodb.collection;
    var db = mongojs(url);
    var collection = db.collection(collectionName);

    function fromMongo(item) {
        if (item.length) item = item.pop();
        item.id = item._id;
        delete item._id;
        return item;
    }
       
    function toMongo(item) {
        delete item.id;
        return item;
    }

    function list(limit, token) {
        token = token ? parseInt(token, 10) : 0;
        return collection.find({})
            .skip(token)
            .limit(limit)
            .toArrayAsync()
            .then(function(results) {
                return {
                    items: results.map(fromMongo),
                    token: results.length === limit ? token + results.length : false
                }
            });
    }

    function create(data) {
        return collection.insertAsync(data).then(function(value) {
            return fromMongo(value);
        });
    }

    function read(id) {
        return collection.findOneAsync({
            _id: mongojs.ObjectId(id)
        }).then(function(result) {
            if (!result) throw { code: 404, message: "Not found" };
            return fromMongo(result);
        });
    }

    function update(id, data) {
        collection.updateAsync({
            _id: mongojs.ObjectId(id)
        }, {
            '$set': toMongo(data)
        }, {
            w: 1
        })
        .then(function () {
            return read(id);
        })
    }

    function _delete(id) {
        return collection.removeAsync({
            _id: mongojs.ObjectId(id)
        });
    }

    return {
        create: create,
        read: read,
        update: update,
        delete: _delete,
        list: list
    };
}
