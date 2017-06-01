var restify = require('restify');

var wundergroundClient = restify.createJsonClient({ url: 'http://api.wunderground.com' });

function getCurrentWeather(location, callback) {
    var escapedLocation = location.replace(/\W+/, '_');
    wundergroundClient.get(`/api/eb67ef77d32048c4/conditions/q/${escapedLocation}.json`, (err, req, res, obj) => {
        console.log(obj);
        var observation = obj.current_observation;
        var results = obj.response.results;
        if (observation) {
            callback(`It is ${observation.weather} and ${observation.temp_c} degrees in ${observation.display_location.full}.`);
        } else if (results) {
            callback(`There are more than one '${location}'. Can specify the exact location please?`);
        } else {
            callback("Error retrieving the weather update.");
        }
    })
}

module.exports = {
    getCurrentWeather: getCurrentWeather
};
