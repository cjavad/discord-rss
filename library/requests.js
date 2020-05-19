const axios = require('axios');
const crypto = require('crypto');
const { JsonDB } = require('node-json-db');
const { DataError } = require('node-json-db/dist/lib/Errors');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

const db = new JsonDB(new Config('db', true, false, '/'));

class Request {
    constructor (webhook, timeout = 5000) {
        this.path = `/${this.getUniqueId(webhook)}`;
        this.stack = [];
        this.webhook = webhook;
        this.timeout = timeout;

        try {
            db.getData(this.path);
        } catch (error) {
            if (error.name === 'DataError') {
                db.push(this.path, []);
            }
        }
    }

    addEmbedToStack (embed) {
        if (this.isUnique(embed)) {
            this.stack.push(embed);
            db.push(this.path + '[]', this.getUniqueId(embed));
        }
    }

    addEmbedsToStack (embeds) {
        embeds.forEach(embed => {
            this.addEmbedToStack(embed);
        });
    }

    executeEmbedStack (options = {}, callback = (error, response) => {}) {
        var chunks = [];

        while (this.stack.length > 0) {
            chunks.push(this.stack.splice(0, 10));
        }

        chunks.forEach(embeds => {
            this.executeSingle({
                method: 'POST',
                url: this.webhook,
                headers: {
                    'Content-Type':'application/json'
                },
                data: {
                    ...options,
                    embeds: embeds
                }
            }, callback);
        });
    }

    executeSingle (reqObj, callback = (error, response) => {}) {
        if (!this.isUnique(reqObj)) { callback(true, this.isUnique(reqObj)) ; return; }
        
        console.log(reqObj);

        setTimeout(() => {
            axios(reqObj)
                .then(response => {
                    var uniqueId = this.getUniqueId(reqObj);
                    db.push(this.path + '[]', uniqueId);
                    callback(null, uniqueId);
                })
                .catch(error => {
                    callback(error, this.getUniqueId(reqObj));
                });
        }, this.timeout);
    }

    getUniqueId (reqObj) {
        return crypto.createHash('sha256').update(JSON.stringify(reqObj)).digest('hex');
    }

    isUnique (reqObj) {
        return !db.getData(this.path).includes(this.getUniqueId(reqObj));
    }
}

module.exports = Request;