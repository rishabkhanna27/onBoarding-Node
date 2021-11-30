module.exports = {
    "heartbeat": true,
    "PORT": 9041,
    "databaseSettings": {
        "MONGODB_URL" :"mongodb://localhost:27017/onboarding_node"
    },
    "twillioCredentials": {
        "accountSid": "",
        "authToken": "",
        "fromNumber": ""
    },
    "JWT_SERVICE": {
        "SECRET_KEY" : "nodesecretkey"
    },
    "sendGrid": {
        "sendgrid_api_key": "",
        "fromEmail": ""
    },
    "fcmKey": {
        "android": "",
        "ios": ""
    },
    "exportUrl":"",
    "apnKey":{
        "keyId":"",
        "teamId":"",
        "bundleId":""
    }
}