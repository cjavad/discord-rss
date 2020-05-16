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

            ['name', 'type', 'rss', 'rules', 'axios'].forEach(key => {
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
    var request = new Request(profile.name, 1000);

    if (profile.type === 'reddit') {
        parser = new RedditParser(profile.rules, profile.axios);
    } else {
        parser = new profile.parser(profile.rules, profile.axios);
    }

    axios.get(profile.rss)
        .then(({ data }) => {
            parser.getEntries(data)
                .then(entries => {
                    entries.forEach(entry => {
                        request.executeSingle(parser.getRequest(entry), (error, response) => {
                            if (error) {
                                // Failed sending :sad:
                                if (error && typeof response === 'string') {
                                    console.log('Skipped', request.getUniqueId(entry), 'as', profile.name);
                                } else {
                                    console.log(error);
                                }
                            } else {
                                console.log('Pushed', request.getUniqueId(entry), 'as', profile.name);
                            }
                        });
                    })
                });
        });
}

function main() {
    loadProfiles(path.join(__dirname, '/profiles')).forEach(profile => {
        console.log('Running', profile.name);
        executeProfile(profile);
    });
}

main();
setInterval(main, config.delay);