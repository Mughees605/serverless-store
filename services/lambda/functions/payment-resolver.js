const dynamodbLib = require("../lib/dynamodb-lib");
const uuid = require("uuid");
const { sendResponse } = require("../lib/response-lib");

exports.main = async (event, context, callback) => {
    switch (event.field) {
        case "addPaymentMethods": {
            return await addPaymentMethods(event.arguments.input);
        }
        case "updatePaymentMethods": {
            return await updatePaymentMethods(event.arguments.input);
        }
        default:
            callback("Unknown field, unable to resolve" + event.field, null);
    }
}


const addPaymentMethods = async (args, createdAt) => {

    try {
        let date = new Date().toISOString()
        var params = {
            TableName: 'payment-dev',
            Item: {
                accountId: args.accountId,
                ...args,
                createdAt: date,
                updatedAt: date,
            },
            ReturnValues: 'ALL_OLD'
        };

        let result = await dynamodbLib.call("put", params);

        console.log(result, "Result")
        return sendResponse(200, { ...params.Item });

    } catch (error) {
        console.log(error);
        return sendResponse(error.statusCode, null, error.message)
    }
}


let updatePaymentMethods = async (args) => {
    try {
        let payment = await dynamodbLib.call("get", {
            TableName: 'payment-dev',
            Key: {
                accountId: args.accountId,
                createdAt: args.createdAt
            }
        });

        if (!payment.Item) {
            return sendResponse(404, null, "Not Found!");
        };

        let propFilter = ['details', 'token', 'type'];
        let propertiesToUpdate = Object.keys(args).filter(p => propFilter.includes(p));

        if (!propertiesToUpdate.length) {
            return sendResponse(400, null, "Properties to Update not Found");
        }
        let data = {};
        propertiesToUpdate.map((prop) => { data[prop] = args[prop] });
        let expression = generateUpdateQuery(data);
        let params = {
            TableName: 'payment-dev',
            Key: {
                accountId: args.accountId,
                createdAt: args.createdAt
            },
            ...expression
        };

        let result = await dynamodbLib.call("update", params);

        console.log("Result = ", result);
        return sendResponse(200, payment.Item);

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
