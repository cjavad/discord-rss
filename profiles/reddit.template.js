/**
 * Example reddit profile for r/manga rss feed
 */
module.exports = {
    name: 'rmanga',
    type: 'reddit',
    rss: 'https://reddit.com/r/manga.rss',
    rules: [
        {
            regex: /\[DISC\]/i,
            match: 'title',
        },
        {
            regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i,
            match: 'url'
        }
    ],
    axios: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        url: 'https://discordapp.com/api/webhooks/'
    }
}