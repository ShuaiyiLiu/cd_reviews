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
            .pipe(fs.createWriteStream('uploads/' + destFileName))
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
        if (req.file && req.file.fieldname === 'image') {
            console.info(req.baseUrl);
            req.file.publicUrl = '/uploads/' + req.file.filename;
        }
        next();
    } 

    // Multer handles parsing multipart/form-data requests.
    // This instance is configured to store images in disk and re-name to avoid
    // conflicting with existing objects.
    var upload = require('multer');
    upload = upload({
        dest: 'public/uploads/',
        fileSize: 5 * 1024 * 1024, // file size no larger than 5MB
        rename: function(fieldname, filename) {
            // generate a unique name
            var suf = filename.split('.')[1];
            return Date.now() + '.' + suf;
        }
    });

    return {
        upload: upload,
        processUploads: processUploads,
        downloadAndSaveImage: downloadAndSaveImage
    };
};
