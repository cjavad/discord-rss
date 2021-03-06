const xml2js = require("xml2js");

module.exports = class Parser {
    constructor (rules = []) {
        this.entryRules = rules;
    }
    
    /**
     * Takes parsed xml (by xml2js)
     * @param {object} parsedXml 
     * 
     * And outputs a list of entries Parser#toEmbed can handle
     */

    // Overwrite this.
    toEntries (parsedXml) {
        return [

        ];
    }

    async getEntries (xml) {
        var parsedXml = await xml2js.parseStringPromise(xml);
        var entries = this.toEntries(parsedXml);
        var validEntries = [];
    
        // rule testing
        entries.forEach(entry => {
            var validEntry = true;

            for (let i = 0; i < this.entryRules.length; i++) {
                const rule = this.entryRules[i];
                if (rule.hasOwnProperty('match') && entry.hasOwnProperty(rule.match) && rule.hasOwnProperty('regex')) {
                    if (!rule.regex.test(entry[rule.match])) {
                        validEntry = false;
                        break;
                    }
                }
            }

            if (validEntry) validEntries.push(entry);
        });

        return validEntries;
    }

    /**
     * Takes a single entry produced by this.toEntries
     * @param {object} entry 
     * And output a discord embed
     */

    // Overwrite this
    toEmbed(entry) {
        
    }
}