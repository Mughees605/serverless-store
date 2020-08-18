const dynamodbLib = require("../lib/dynamodb-lib");
const uuid = require("uuid");
const { sendResponse } = require("../lib/response-lib");

exports.main = async (event, context, callback) => {
    switch (event.field) {
        case "createOrder": {
            return await createOrder(event.arguments.input);
        }
        case "addCompletedAt": {
            return await addCompletedAt(event.arguments);
        }
        default:
            callback("Unknown field, unable to resolve" + event.field, null);
    }
}


const createOrder = async (args) => {

    try {
        let id = uuid.v1();
        var params = {
            TableName: 'order-dev',
            Item: {
                orderId: id,
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


const addCompletedAt = async (args) => {
    /*
      Args: { orderId, completedAt }
    */
    try {
        let orderId = args.orderId;

        let order = await dynamodbLib.call("get", {
            TableName: 'order-dev',
            Key: { orderId }
        });

        if (!order.Item) {
            return sendResponse(404, null, "Not Found!");
        };


        let updateOrder = await dynamodbLib.call("update", {
            TableName: 'order-dev',
            Key: {
                orderId
            },
            UpdateExpression: "set #completedAt = :completedAtValue",
            ExpressionAttributeNames: {
                "#completedAt": "completedAt",
            },
            ExpressionAttributeValues: {
                ":completedAtValue": args.completedAt,
            }
        });
        console.log("ORDER completedAtValue CHANGED = ", updateOrder);
        return sendResponse(200, { ...order.Item, completedAt: args.completedAt });

    } catch (error) {
        console.log(error);
        return sendResponse(error.statusCode, null, error.message)
    }
}