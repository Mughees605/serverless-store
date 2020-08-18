const dynamodbLib = require("../lib/dynamodb-lib");
const { sendResponse } = require("../lib/response-lib");

exports.main = async (event, context, callback) => {
    switch (event.field) {
        case "createReview": {
            return await createReview(event.arguments.input, event.reviewAt);
        }
        case "updateReview": {
            return await updateReview(event.arguments.input);
        }
        default:
            callback("Unknown field, unable to resolve" + event.field, null);
    }
}


const createReview = async (args, reviewAt) => {
    // Args accountId
    try {
        let date = new Date().toISOString()

        var params = {
            TableName: 'review-dev',
            Item: {
                accountId: args.accountId,
                reviewAt,
                ...args,
                createdAt: date,
                updatedAt: date,
            },
            ReturnValues: 'ALL_OLD'
        };

        let result = await dynamodbLib.call("put", params);


        return sendResponse(200, { ...params.Item });

    } catch (error) {
        console.log(error);
        return sendResponse(error.statusCode, null, error.message)
    }
}


let updateReview = async (args) => {
    // Args id, name, profilepicture
    // only updates profile and name
    try {

        let review = await dynamodbLib.call("get", {
            TableName: 'review-dev',
            Key: {
                accountId: args.accountId,
                reviewAt: args.reviewAt
            }
        });

        console.log("REVIDW", review)

        if (!review.Item) {
            return sendResponse(404, null, "Not Found!");
        };

        let propFilter = ['storeId', 'itemIds', 'ratings', 'speed', 'service', 'text'];
        let propertiesToUpdate = Object.keys(args).filter(p => propFilter.includes(p));

        if (!propertiesToUpdate.length) {
            return sendResponse(400, null, "Properties to Update not Found");
        }
        let data = {};
        propertiesToUpdate.map((prop) => { data[prop] = args[prop] });
        let expression = generateUpdateQuery(data);
        let params = {
            TableName: 'review-dev',
            Key: {
                accountId: args.accountId,
                reviewAt: args.reviewAt
            },
            ...expression
        };

        let result = await dynamodbLib.call("update", params);

        console.log("Result = ", result);
        return sendResponse(200, review.Item);

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
