const AWS = require("aws-sdk");

 function call(action, params) {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    return dynamoDb[action](params).promise();
}

function tName(name){
    return tableNames[name]
}

let tableNames = {
    user: "user",
    waypoint: "waypoint",
    route: "RouteTable",
    car: "CarTable"
}

module.exports = {
    call,
    tName
}