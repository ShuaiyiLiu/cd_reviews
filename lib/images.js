var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');

module.exports = function () {
    
    // Downloads a given image (by url) and then save to local disk.
    // Provides the publicly accessable URL to the callback.
    function downloadAndSaveImage(sourceUrl, destFileName) {
        request
            .get(sourceUrl)
            .on('error', function(err) {
                return Promise.reject(err);
            })
            .pipe(fs.createWriteStream('../images/' + destFileName))
            .on('finish', function() {
                return Promise.resolve(destFileName);
            })
            .on('error', function(err) {
                return Promise.reject(err);
            });
    }

    // Express middleware that will automatically pass uploads to Cloud Storage.
    // Each file in req.files is processed and will have a new property:
    // publicUrl.
    function processUploads(req, res, next) {
        var numFiles = Object.keys(req.files).length;
        if (!numFiles) return next();

        function checkNext(err) {
            numFiles--;
            if (numFiles === 0) next();
        }

        Object.keys(req.files).forEach(function(key) {
            var uploadedFile = req.files[key];
            uploadedFile.publicUrl = '../images/' + uploadedFile.name;
            checkNext();
        });
        next();
    } 

    // Multer handles parsing multipart/form-data requests.
    // This instance is configured to store images in disk and re-name to avoid
    // conflicting with existing objects.
    var multer = require('multer');
    multer = multer({
        dest: '../images/',
        fileSize: 5 * 1024 * 1024, // file size no larger than 5MB
        rename: function(fieldname, filename) {
            // generate a unique name
            return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
        }
    });

    return {
        multer: multer,
        downloadAndSaveImage: downloadAndSaveImage
    };
};
