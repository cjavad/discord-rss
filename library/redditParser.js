const Parser = require('./parser');

module.exports = class RedditParser extends Parser {
    toEntries (parsedXml) {
        var entries = [];
        if (!parsedXml) return;
        if (!parsedXml.hasOwnProperty('feed')) return;
        if (!parsedXml.feed.hasOwnProperty('entry')) return;

        parsedXml.feed.entry.forEach(rssEntry => {
            entries.push({
                id: rssEntry.id[0],
                url: rssEntry.link[0]['$'].href,
                links: rssEntry.content[0]._.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi),
                title: rssEntry.title[0],
                authorName: rssEntry.author[0].name[0],
                authorUrl: rssEntry.author[0].uri[0],
                updated: new Date(rssEntry.updated[0])
            });
        });

        return entries;
    }

    toRequest (entry) {
        return {
            embeds: [
                {
                    title: entry.title,
                    url: entry.url,
                    author: {
                        name: entry.authorName,
                        url: entry.authorUrl
                    },
                    thumbnail: {
                        url: entry.links.filter(x => /thumb/.test(x))[0] || ''
                    }
                }
            ]
        }
    }
}