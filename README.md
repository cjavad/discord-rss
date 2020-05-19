# discord-rss

A cool and easy way to stay up to date with your rss feeds.

## Profiles

Profiles are the rss configs and parsers you see in /profiles. Currently i have implemented to types of profiles, a `reddit` one that can parse any r/subreddit.rss rss feed and a custom type where you can define your own parsing and output.

Profiles also allows you to set regex rules to filter out specific posts, such as only included `[DISC]` posts from r/manga (as seen in reddit.template.js).

Per default this program is targeted towards discord webhooks but due to the wide extensibilty of the parser class you could format your data to any kind of webhook or http endpoint.

### Parser

When creating your own parser you have to overwrite to function in the `Parser` class, that would be `toEntries` and `toEmbed`.

```js
// require base class
const Parser = require('../libary/parser')

// extend class with your own
class MyParser extends Parser {
    // parsedXml is xml simply parsed with xml2js
    // figuring out the format interactivly gives you a huge advantage making the parser
    // Should return a list of formatted entries to use with Parser#toRequest()
    toEntries (parsedXml) {

    }

    // entry is a single entry made by Parser#toEntries()
    // should return a discord embed object
    // https://discord.com/developers/docs/resources/webhook#execute-webhook
    toEmbed (entry) {

    }
}
```

### Profile format

```js
module.exports = {
    type: 'reddit', // reddit or custom (module.exports.parser has to be defined if type is custom)
    rss: 'https://reddit.com/r/subreddit', // direct http url for the plaintext/xml rss feed
    rules: [
        {
            regex: /Regex\ to \ match/i,
            match: 'keyToUseRegex',
        },
        ...
    ],
    webhooks: [
        {
            url: 'https://discordapp.com/api/webhooks/', // discord webhook url
            options: { // Non embed per message options such as content to mention a user or role
                content: '<@roleid>',
                allowed_mentions: {
                    parse: ['roles']
                }
            }
        },
        ...
    ]
}
```
