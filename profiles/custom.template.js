/**
 * Example custom profile for mangadex rss feed
 */
const Parser = require('../library/parser');

function get_id_from_mdlink(url) {
    var length = url.length - 1;

    if (url.charAt(length) === "/") {
        url = url.substring(0, length);
    }

    return url.substring(url.lastIndexOf("/") + 1);
}

class MangadexParser extends Parser {
    toEntries (parsedXml) {
        var entries = [];
        
        if (!parsedXml) return;
        if (!parsedXml.hasOwnProperty('rss')) return;
        if (!parsedXml.rss.hasOwnProperty('channel')) return;
        if (!parsedXml.rss.channel.length) return;
        if (!parsedXml.rss.channel[0].hasOwnProperty('item')) return;

        parsedXml.rss.channel[0].item.forEach(entry => {
            entries.push({
                title: entry.title[0],
                link: entry.link[0],
                mangaLink: entry.mangaLink[0],
                imageLink: `https://mangadex.org/images/manga/${get_id_from_mdlink(entry.mangaLink[0])}.jpg`,
                description: entry.description[0],
                publishedAt: new Date(entry.pubDate[0])
            });
        });

        return entries;
    }

    toRequest (entry) {
        return {
            embeds: [
                {
                    title: entry.title,
                    url: entry.link,
                    thumbnail: {
                        url: entry.imageLink
                    }
                }
            ]
        }
    }
}

module.exports = {
    name: 'mangadex',
    type: 'custom',
    rss: 'https://mangadex.org/rss/',
    rules: [
        {
            regex: /English/i,
            match: 'description'
        }
    ],
    axios: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        url: 'https://discordapp.com/api/webhooks/'
    },
    parser: MangadexParser
}