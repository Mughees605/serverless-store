global.fetch = require('node-fetch');
const http = require('http');
let url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/55.651966,12.556645;55.670806,12.53221;55.681078,12.443659?access_token=${process.env.MAPBOX_TOKEN}`;
const getOptimisedWaypointsRequest = (waypoints) => {

    return httpRequest(waypoints);
}

const getOptimisedWaypointsFetch = (coordinates) => {
    return fetch(`https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?access_token=${process.env.MAPBOX_TOKEN}`);
}

const httpRequest = (coordinates) => {
    return new Promise((resolve, reject) => {
        const options = {
            host: 'api.mapbox.com',
            path: `/optimized-trips/v1/mapbox/driving/${coordinates}?access_token=${process.env.MAPBOX_TOKEN}`,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            resolve(res);
        });

        req.on('error', (e) => {
            reject(e.message);
        });

        // send the request
        req.write('');
        req.end();
    });
}


module.exports = {
    getOptimisedWaypointsRequest,
    getOptimisedWaypointsFetch,
    httpRequest
}
