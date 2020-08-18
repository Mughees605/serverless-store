// dynamodb work
const AWS = require('aws-sdk');
const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-19",
    region: "eu-west-2"
});

// methods for admins only

let createUser = (userData) => {
    return new Promise((resolve, reject) => {
        COGNITO_CLIENT.adminCreateUser(userData, (error, data) => {
            if (error) {
                reject(error)
            }
            else {
                console.log(data.User.Attributes,"userAttributes")
                resolve(data)
            }
        })
    })
}

let deleteUser = (userData) => {
    return new Promise((resolve, reject) => {
        COGNITO_CLIENT.adminDeleteUser(userData, (error, data) => {
            if (error) {
                reject(error)
            }
            else {
                resolve(data)
            }
        })
    })
}

let getUser = (userData) => {
    return new Promise((resolve, reject) => {
        COGNITO_CLIENT.adminGetUser(userData, (error, data) => {
            if (error) {
                reject(error)
            }
            else {
                resolve(data)
            }
        })
    })
}


let updateUser = (userData) => {
    return new Promise((resolve, reject) => {
        COGNITO_CLIENT.adminUpdateUserAttributes(userData, (error, data) => {
            if (error) {
                reject(error)
            }
            else {
                resolve(data)
            }
        })
    })
}


let addUserInGroup = (groupData) => {
    return new Promise((resolve, reject) => {
        COGNITO_CLIENT.adminAddUserToGroup(groupData, (error, data) => {
            if (error) {

                reject(error)
            }
            else {
                resolve(data)
            }
        })
    })
}

let getUsersList = (params) => {
    return new Promise((resolve, reject) => {
        COGNITO_CLIENT.listUsers(params, (error, data) => {
            if (error) {

                reject(error)
            }
            else {
                resolve(data)
            }
        })
    })
} 

module.exports = {
    createUser,
    addUserInGroup,
    deleteUser,
    updateUser,
    getUser,
    getUsersList
}
