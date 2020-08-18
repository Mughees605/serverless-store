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
        let date = new Date().toISOString()
        var params = {
            TableName: 'reservation-dev',
            Item: {
                id: id,
                ...args,
                createdAt: date,
                updatedAt: date,
            },
            ReturnValues: 'ALL_OLD',

        };

        let result = await dynamodbLib.call("put", params);


        return sendResponse(200, { ...params.Item });

    } catch (error) {
        console.log(error);
        return sendResponse(error.statusCode, null, error.message)
    }
}


let updateReservation = async (args) => {
    // Args id, name, profilepicture
    // only updates profile and name
    try {
        let reservation = await dynamodbLib.call("get", {
            TableName: 'reservation-dev',
            Key: {
                id: args.id,
            }
        });

        if (!reservation.Item) {
            return sendResponse(404, null, "Not Found!");
        };

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
        return sendResponse(200, reservation.Item);

    } catch (error) {
        console.log(error);
        return sendResponse(500);
    }
}

const generateUpdateQuery = (fields) => {
    let exp = {
        UpdateExpression: 'set',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item
    });
    exp.UpdateExpression = exp.UpdateExpression.trim(',')
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    return exp;
}
