const config = require('../config/config')
// const client = require('twilio')(config.twillioCredentials.accountSid, config.twillioCredentials.authToken, {
//     lazyLoading: true
// });
const fromNumber = config.twillioCredentials.fromNumber;
const constants = require('../common/constants')
const functions = require('../common/functions')
const Model = require('../models/index')
const moment = require('moment')

const sendSMSTwillo = async (dialCode, phoneNo, message) => {
    return new Promise((resolve, reject) => {
        const smsOptions = {
            from: fromNumber,
            to: "+" + dialCode + (phoneNo ? phoneNo.toString() : ''),
            body: message,
        };
        client.messages.create(smsOptions).then(message => console.log(message.sid)).catch(err => console.log(err));
    });
};

const sendSMS = async (dialCode, phoneNo, message) => {
    return new Promise((resolve, reject) => {
        console.log("sms send ", dialCode, phoneNo, message)
        sendSMSTwillo(dialCode, phoneNo, message);
        return resolve(message);
    });
};

//Verification 

exports.sendPhoneVerification = async (payload) => {
    try {
        if (!payload.timeZone) throw new Error(constants.MESSAGES.TIME_MISSING); // TimeZone difference from iso 
        if (!payload.userId) throw new Error(constants.MESSAGES.USER_DATA_MISSING);
        if (!payload.dialCode) throw new Error(constants.MESSAGES.DIAL_CODE_MISSING);
        if (!payload.phoneNo) throw new Error(constants.MESSAGES.PHONE_MISSING);
        let otp = functions.generateNumber(4)
        let expireTime = Number(Number(payload.timeZone) + 10)  // Otp expire after 10 min
        let tobeUpdated = {
            otp : otp,
            otpExpire : new Date(moment().add(expireTime , "m"))
        }
        
        await Model.User.findOneAndUpdate({
            _id : payload.userId
        }, {
            $set : tobeUpdated
        },{
            new : true
        });
        let payloadData = {
            phoneNo: payload.phoneNo,
            dialCode: payload.dialCode,
            message: `Your verification code is ${otp}`
        }
        console.log("OTP----------------->",payloadData.message,"<------------------")
        await sendSMS(payloadData.dialCode, payloadData.phoneNo, payloadData.message);
    } catch (error) {
        console.error("sendPhoneVerification", error);
    }
};