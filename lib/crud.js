'use strict';

var express = require('express');

module.exports = function(model, images) {
    var router = express.Router();

    // Use the images middleware to automatically upload images to local disk
    router.use(images.multer);

    // TODO: use the oauth middleware to automatically get the user's profile
    // information and expose login/logout URLs to templates
    
    function handleRpcError(err, res) {
        res.status(err.code || 500).send(err.message);
    }

    router.use(function(req, res, next) {
        res.set('Content-Type', 'text/html'); 
        next();
    });

    router.get('/', function list(req, res) {
        model
            .list(10, req.query.pageToken) // WTH does pageToken come from???
            .then(function(results) {
                res.render('albums/list.jade', {
                    albums: results.items,
                    nextPageToken: results.token
                }); 
            })
            .catch(function (err)) {
                handleRpcError(err);
            });
    });

    router.get('/add', function addForm(req, res) {
        res.render('albums/form.jade', {
            album: {},
            action: 'Add'
        });
    });

    router.post('/add', function insert(req, res) {
        var data = req.body;

        // Was an image uploaded? if so, store it in local disk.
        if (req.files.image && req.files.image.publicUrl) {
            data.imageUrl = req.files.image.publicUrl;
        }

        // Save the data to database.
        model
        .create(data)
        .then(function(savedData) {
            res.redirect(req.baseUrl + '/' + savedData.id);
        })
        .catch(function(err) {
            handleRpcError(err);
        });
    });

    router.get('/:album/edit', function editForm(req, res) {
        model
        .read(req.params.album)
        .then(function(entity) {
            res.render('albums/form.jade', {
                album: entity,
                action: 'Edit'
            });
        })
        .catch(function (err) {
            handleRpcError(err);
        });
    });

    router.post('/:album/edit', function updata(req, res) {
        var data = req.body;

        // Was an image uploaded? If so, save to local disk
        
        if (req.files.image && req.files.image.publicUrl) {
            req.body.imageUrl = req.files.image.publicUrl;
        }

        model
        .update(req.params.album)
        .
    
    });

};
