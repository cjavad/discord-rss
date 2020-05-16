const axios = require('axios');
const crypto = require('crypto');
const { JsonDB } = require('node-json-db');
const { DataError } = require('node-json-db/dist/lib/Errors');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

const db = new JsonDB(new Config('db', true, false, '/'));

class Request {
    constructor (profileName, delay = 100) {
        this.path = `/${profileName}`;
        this.stack = [];
        this.timeout = delay;

        try {
            db.getData(this.path);
        } catch (error) {
            if (error.name === 'DataError') {
                db.push(this.path, []);
            }
        }
    }

    addToStack (reqObj) {
        this.stack.push(reqObj);
    }

    executeStack (callback = (error, response) => {}) {
        this.stack.forEach(reqObj => {
            this.executeSingle(reqObj, callback);
        });
    }

    executeSingle (reqObj, callback = (error, response) => {}) {
        if (!this.isUnique(reqObj)) { callback(true, "Invalid Object") ; return; }

        setTimeout(() => {
            axios(reqObj)
                .then(response => {
                    db.push(this.path + '[]', this.getUniqueId(reqObj));
                    callback(null, response);
                })
                .catch(error => {
                    callback(error, error.response);
                });
        }, this.timeout);
    }

    getUniqueId (reqObj) {
        return crypto.createHash('sha256').update(reqObj.toString()).digest('hex');
    }

    isUnique (reqObj) {
        return !db.getData(this.path).includes(this.getUniqueId(reqObj));
    }
}

module.exports = Request;