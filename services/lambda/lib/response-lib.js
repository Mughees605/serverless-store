function success(body) {
    return buildResponse(200, body);
}

function failure(body) {
    return buildResponse(500, body);
}

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(body)
    };
}

const sendResponse = (statusCode, body, errorMessage) => {
    if (errorMessage) {
        return {
            statusCode,
            data: body,
            errorMessage
        }
    }
    else {
        return {
            statusCode,
            data: body
        }
    }
}

module.exports = {
    success,
    failure,
    sendResponse
}