const fs = require('fs')
var watermark = require('image-watermark');
var keyconfig = require("../helper/config")
var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var mv = require('mv')
var fileHelper = require('../helper/file_helper');
const keypair = require('keypair');
const crypto = require('crypto');

router.post('/', function (req, res, next) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var oldpath = files.file.path;
        var newpath = __dirname + "/../upload/" + files.file.name;

        mv(oldpath, newpath, function (err) {
            if (err) {
                var errorResponse = JSON.stringify({
                    status: false,
                    message: err
                })

                return res.end(errorResponse);
            }

            return res.end(
                JSON.stringify({
                    status: true,
                    message: "document uploaded",
                    data: null
                }));
        });
    });

});

router.post('/verify', function (req, res, next) {

    const filePath = __dirname + "/../upload/" + req.body.filename;
    // var options = {
    //     'text' : 'Verifed by SMKN 2 Yogyakarta Using DOKUIN APP',
    //     'position': 'SouthEast'
    // };
    // watermark.embedWatermark(filePath, options);
    console.log(filePath)

    try {
        if (fs.existsSync(filePath)) {



            var fileBase64 = fileHelper.getBase64(filePath)
            var encrypedData = fileHelper.encryptData(fileBase64, keyconfig.get('publickey'))

            fs.writeFileSync(__dirname + "/../upload/" + req.body.filename, encrypedData);

            return res.end(
                JSON.stringify({
                    status: true,
                    message: "document uploaded",
                    data: {
                        status : "File has been verify"
                    }
                }));
        }
    } catch (e) {
        var errorResponse = JSON.stringify({
            status: false,
            message: e.message,
            data: null
        })

        return res.end(errorResponse);
    }

})


router.post('/check', function (req, res, next) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {

        var oldpath = files.file.path;
        var newpath = __dirname + "/../temp/" + files.file.name;
        var realFile = __dirname + "/../upload/" + files.file.name;

        mv(oldpath, newpath, function (err) {
            if (err) {
                var errorResponse = JSON.stringify({
                    status: false,
                    message: err,
                    data: null
                })
                return res.end(errorResponse);
            }
        })

        var checkFilePath = newpath
        var fileBase64 = fileHelper.getBase64(checkFilePath)
        var fileBase64Sub = fileBase64.substr(fileBase64.length - 20, fileBase64.length)
        keyconfig.set('fileBase64', fileBase64Sub);

        let fileBase64Buff = Buffer.from(fileBase64Sub);
        let signatureCheckFile = crypto.privateEncrypt(keyconfig.get('privatekey'), fileBase64Buff).toString('base64');
        let signatureBuff = Buffer.from(signatureCheckFile, 'base64');

        if (!fs.existsSync(realFile)) {
            var errorResponse = JSON.stringify({
                status: false,
                message: "File not exist",
                data: null
            })
            return res.end(errorResponse);
        }
        var realFileBase64 = fileHelper.getBase64(realFile)
        var subRealFileBase64 = realFileBase64.substr(realFileBase64.length - 20, realFileBase64.length)

        var publickey = fields.publickey

        try {
            var verifyDoc = crypto.publicDecrypt(publickey, signatureBuff).toString('utf8');
        } catch (e) {
            return res.end("Data beda" + err)
        }

        if (subRealFileBase64 == verifyDoc) {
            return res.end(JSON.stringify({
                status: true,
                message: "check document success",
                data: {
                    checkstatus: true
                }
            }))
        } else {
            return res.end(JSON.stringify({
                status: true,
                message: "check document success",
                data: {
                    checkstatus: false
                }
            }))
        }
    })
})

router.get('/key', function (req, res, next) {

    var publicKey = keyconfig.get('publickey')
    return res.end(
        JSON.stringify({
            status: true,
            message: "request success",
            data: {
                key: publicKey
            }
        }));
})

router.get('/', function (req, res, next) {

    var filename = req.query.filename;
    var publickey = req.query.key;

    var filepath = __dirname + "/../upload/" + filename
    const file_buffer = fs.readFileSync(filepath);
    const encryptedContent = file_buffer.toString('utf-8');
    var decryptedData = fileHelper.decryptData(encryptedContent, publickey)

    try {
        fileHelper.saveTempFromBase64(decryptedData, filename)
    } catch (e) {
        var errorResponse = JSON.stringify({
            status: false,
            message: e.message,
            data: null
        })
    }

    fs.readFile(__dirname + "/../temp/" + filename , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
})

router.get("/unverif", function (req, res, next) {
    var filename = req.query.filename;
    fs.readFile(__dirname + "/../upload/" + filename , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
})

module.exports = router;
