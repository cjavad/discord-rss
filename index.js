const fs = require('fs');
const path = require('path')
const axios = require('axios');
const config = require('./config.json');

var RedditParser = require('./library/redditParser');
var Request = require('./library/requests');

function loadProfiles (profilePath) {
    var files = fs.readdirSync(profilePath);
    var profiles = []

    for (let i = 0; i < files.length; i++) {
        if (!files[i].includes('template')) {
            var validProfile = true;
            var profile = require(path.join(profilePath, files[i]));

            ['type', 'rss', 'rules', 'webhooks'].forEach(key => {
                if (!Object.keys(profile).includes(key)) {
                    validProfile = false;
                    return;
                }
            });

            if (validProfile) profiles.push(profile);
        }
    }
    return profiles;
}

function executeProfile(profile) {
    let parser;
    let request;

    if (profile.type === 'reddit') {
        parser = new RedditParser(profile.rules);
    } else {
        parser = new profile.parser(profile.rules);
    }

    axios.get(profile.rss)
        .then(({ data }) => {
            parser.getEntries(data)
                .then(entries => {
                    var embeds = [];

                    entries.forEach(entry => {
                        embeds.push(parser.toEmbed(entry));
                    });

                    profile.webhooks.forEach((webhook, index) => {
                        var options = webhook.options || profile.options || undefined;
                        request = new Request(webhook.url, config.timeout);
                        request.addEmbedsToStack(embeds);
                        request.executeEmbedStack(options, (error, uniqueId) => {
                            if (error) {
                                // Failed sending :sad:
                                if (typeof error === 'boolean' && typeof uniqueId === 'string') {
                                    console.log('Skipped', uniqueId, 'at', profile.rss);
                                } else {
                                    console.log(error);
                                }
                            } else {
                                console.log('Pushed', uniqueId, 'from', profile.rss);
                            }

                            console.log('Ran', profile.rss, 'with webhook #' + (index + 1));
                        });
                    });
                });
        });
}

function main() {
    loadProfiles(path.join(__dirname, '/profiles')).forEach(profile => {
        console.log('Running', profile.rss);
        executeProfile(profile);
    });
}

main();
setInterval(main, config.delay);