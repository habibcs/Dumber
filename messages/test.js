var jsonString = '{"score":0.999998569,"intent":"Greeting","intents":[{"intent":"Greeting","score":0.999998569},{"intent":"None","score":0.11016015},{"intent":"Weather","score":8.913534e-7}],"entities":[{"entity":"hi","type":"builtin.geography.us_state","startIndex":0,"endIndex":1}]}';

console.log(jsonString + '\r\n');

jsonString = '{"score":0.9067564,"intent":"Weather","intents":[{"intent":"Weather","score":0.9067564},{"intent":"None","score":0.4061692},{"intent":"Greeting","score":1.23606554e-7}],"entities":[{"entity":"paris","type":"builtin.geography.city","startIndex":23,"endIndex":27,"score":0.9993435},{"entity":"paris","type":"Weather.Location","startIndex":23,"endIndex":27,"score":0.9806194}]}'
var objUserIntention = JSON.parse(jsonString);

console.log('Weather for ' + objUserIntention.entities[0].entity + ' is great');