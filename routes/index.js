var express = require('express');
var request = require("request");
var async = require("async");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res) {

	/* Request to Wunderground API for nearest weather stations to current location */
	request("http://api.wunderground.com/api/b72f7eac14a73b00/geolookup/q/autoip.json", function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var cities = JSON.parse(body).location.nearby_weather_stations.airport.station;
			var nearestCities = [];
			// Push your current city to nearestCities
			nearestCities.push({"name": JSON.parse(body).location.state + "/" + JSON.parse(body).location.city});
			// Push the three closest cities to nearestCities
			for (var i = 0; i < 3; i++) {
				nearestCities.push({"name": cities[i].state + "/" + cities[i].city});
			}
			// Used in async.map to extract relavent information from JSON returned by the API
			var getInfo = function(city, doneCallback) {
				request("http://api.wunderground.com/api/b72f7eac14a73b00/conditions/q/" + city.name + ".json",
						function(error, response, body) {
							if (!error && response.statusCode == 200) {
								var parsedBody = JSON.parse(body);
								var name = parsedBody.current_observation.display_location.full;
								var temp = parsedBody.current_observation.temp_f;
								var weather = parsedBody.current_observation.weather;
								if (weather == "Clear") {
									var img = "/images/clear.png";
								}
								if (weather == "Partly Cloudy") {
									var img = "/images/partlycloudy.png";
								}
								if (weather == "Cloudy" || weather == "Mostly Cloudy") {
									var img = "/images/cloudy.png";
								}
								var precip = parseInt(parsedBody.current_observation.precip_today_in);
								if (precip == 0) {
									precip = "no";
								} else {
									precip = precip + " inches of";
								}
								var wind = parsedBody.current_observation.wind_mph;
								return doneCallback(null, {"name": name, "temp": temp, "weather": weather, "img": img, "precip": precip, "wind": wind});
							}	
						});
			};
			/* Maps getInfo over each city in nearestCities and renders the html after
			 all calls to the API have returned */
			async.map(nearestCities, getInfo, function(err, results) {
				nearestCities = results;

				res.render("index",
							{city0: nearestCities[0].name,
							 temp0: nearestCities[0].temp,
							 weather0: nearestCities[0].weather,
							 img0: nearestCities[0].img,
							 precip0: nearestCities[0].precip,
							 wind0: nearestCities[0].wind,
							 city1: nearestCities[1].name,
							 temp1: nearestCities[1].temp,
							 weather1: nearestCities[1].weather,
							 img1: nearestCities[1].img,
							 precip1: nearestCities[1].precip,
							 wind1: nearestCities[1].wind,
							 city2: nearestCities[2].name,
							 temp2: nearestCities[2].temp,
							 weather2: nearestCities[2].weather,
							 img2: nearestCities[2].img,
							 precip2: nearestCities[2].precip,
							 wind2: nearestCities[2].wind,
							 city3: nearestCities[3].name,
							 temp3: nearestCities[3].temp,
							 weather3: nearestCities[3].weather,
							 img3: nearestCities[3].img,
							 precip3: nearestCities[3].precip,
							 wind3: nearestCities[3].wind});
			});
		};
	});
});

module.exports = router;

