/*-----------------------------------------------------------------------------
Got this as a template from the Azure Bot Service (function app) directly.
-----------------------------------------------------------------------------*/
// @ts-check 

"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var weatherClient = require('./wunderground');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

//const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
const LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/523b9095-1964-46d6-8493-7b34305206f2?subscription-key=258ea5c54fda4c56b918dc52b45a7f23&timezoneOffset=0&verbose=true&q='

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

    /*
    .matches('None', (session, args) => {
        session.send('This is None intent, You said: \'%s\'', session.message.text)    
    })*/

    .matches('Weather', [
        (session, args, next) => weatherParserFunction(session, args, next),
        (session, results) => {
            weatherClient.getCurrentWeather(results.response, (responseString) => {
                session.send(responseString);
            })
        }
    ])

    .matches('Greeting', (session, args) => {
        session.send('Hello - Thanks for the greeting!')
    })

    .matches('GreetingPlus', (session, args) => {
        session.send('I am good, thanks! Hope you are great as well, how may I help you.')
    })

    .matches('EndGreeting', (session, args) => {
        if (session.message.text.toLowerCase().match(/have a good.*/))
            session.send('You too, bye.');
        else session.send('Have a good day! Bye.')
    })

    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'.', session.message.text);
    });

bot.dialog('/', intents);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

function weatherParserFunction(session, args, next) {
    //var locationEntity = builder.EntityRecognizer.findEntity(args.entities, 'Weather.Location'); //args.entities[0].entity;
    var city = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
    var country = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.country');
    if (city && country && city.entity != 'there') {
        session.dialogData.searchType = 'weather';
        session.send('Fetching the weather info for the location: \'%s\'', city.entity);
        next({ response: city.entity + ', ' + country.entity });
    }
    else
        session.send('Sorry I could not find the exact location to tell you it\'s weather, can you please tell me again like: Paris, France (City, Country)?');
        //builder.Prompts.text(session, 'Sorry I did not understand the exact location for the weather, Can you please tell again like: Paris, France (City, Country)?'); // => this way directly sends to the next in response function
}