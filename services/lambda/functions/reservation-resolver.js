const dynamodbLib = require("../lib/dynamodb-lib");
const uuid = require("uuid");
const { sendResponse } = require("../lib/response-lib");

exports.main = async (event, context, callback) => {
    switch (event.field) {
        case "createReservation": {
            return await createReservation(event.arguments.input);
        }
        case "updateReservation": {
            return await updateReservation(event.arguments.input);
        }
        default:
            callback("Unknown field, unable to resolve" + event.field, null);
    }
}


const createReservation = async (args) => {

    try {
        let id = uuid.v1();
        var params = {
            TableName: 'reservation-dev',
            Item: {
                id: id,
                ...args,
            }
        };

        let result = await dynamodbLib.call("put", params).promise();
        

        return sendResponse(200, result);

    } catch (error) {
        console.log(error);
        return sendResponse(error.statusCode, null, error.message)
    }
}


let updateReservation = async (args) => {
    // Args id, name, profilepicture
    // only updates profile and name
    try {
        let propFilter = ['storeId', 'reservationToken', 'orderId'];
        let propertiesToUpdate = Object.keys(args).filter(p => propFilter.includes(p));

        if (!propertiesToUpdate.length) {
            return sendResponse(400, null, "Properties to Update not Found");
        }
        let data = {};
        propertiesToUpdate.map((prop) => { data[prop] = args[prop] });
        let expression = generateUpdateQuery(data);
        let params = {
            TableName: 'reservation-dev',
            Key: {
               id: args.id,
            },
            ...expression
        };

        let result = await dynamodbLib.call("update", params);

        console.log("Result = ", result);
        return sendResponse(200, result);

    } catch (error) {
        console.log(error);
        return sendResponse(500);
    }
}