const AWS = require('aws-sdk')

const handlePromise = (promise) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]));
}

const invokeLambda = (lambdaInvokeProp) => {
    const lambda = new AWS.Lambda();

    // @lambdaInvokeProp  FunctionName: 'tribato-lambda-dev-MeetupLambda', InvocationType: "RequestResponse", LogType: "Tail", Payload: JSON.stringify({ field: "listMeetupVoters", arguments: args.input })
    return new Promise((resolve, reject) => {
        lambda.invoke({ ...lambdaInvokeProp }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}


module.exports = {
    handlePromise,
    invokeLambda
}
