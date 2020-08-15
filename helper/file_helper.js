const fs = require('fs')
const crypto = require('crypto');

module.exports = {
    getBase64: function (file) {
        const file_buffer = fs.readFileSync(file);
        const contents_in_base64 = file_buffer.toString('base64');
        return contents_in_base64
    },
    saveTempFromBase64: function (data, filename) {
        var buf = Buffer.from(data, 'base64');
        fs.writeFile(__dirname + "/../temp/" + filename, buf, error => {
            if (error) {
                throw error;
            } else {
                console.log('buffer saved!');
            }
        });
    },
    getNameBase64: function (nameFile) {
        const contents_in_base64 = nameFile.toString('base64');
        return contents_in_base64
    },
    encryptData: function (data, publicKey) {

        try {
            var cipher = crypto.createCipheriv('aes-256-cbc',
                new Buffer('passwordpasswordpasswordpassword'), new Buffer('vectorvector1234'))
            var crypted = cipher.update(data, 'utf8', 'hex')
            crypted += cipher.final('hex')
            return crypted
        } catch (e) {
            throw e
        }

    },
    decryptData: function (data, publicKey) {

        try {
            var decipher = crypto.createDecipheriv('aes-256-cbc',
                new Buffer('passwordpasswordpasswordpassword'), new Buffer('vectorvector1234'))
            var dec = decipher.update(data, 'hex', 'utf8')
            dec += decipher.final('utf8')
            return dec
        } catch (e) {
            throw e
        }

    }


}

