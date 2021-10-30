const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const fromMail = "aaron@thelassoapp.com"

const constants = require('../common/constants')
const Model = require('../models/index')
const functions = require('../common/functions')


exports.broadCastEmail = async (payload) => {
    try {
        const msg = {
            to: payload.to,
            from: fromMail,
            subject: payload.title,
            html: payload.message
        };
        const result = await sgMail.send(msg);
        console.log(result, "result");
        return result
    } catch (error) {
        return error;
    }
}

exports.send = async (payload) => {
    try {
        const msg = {
            to: payload.to,
            from: fromMail,
            subject: payload.title,
            html: payload.message
        };
        const result = await sgMail.send(msg);
        if(result){
            console.log("Email sent successfully")
            return result
        }else{
            console.log("Error in sending the mail")
        }
    } catch (error) {
        return error;
    }
}

//Verification

exports.sendEmailVerification = async (payload) => {
    try {
    if (!payload.timeZone) throw new Error(constants.MESSAGES.TIME_MISSING); // TimeZone difference from iso 
    if (!payload.userId) throw new Error(constants.MESSAGES.USER_DATA_MISSING);
    if (!payload.email) throw new Error(constants.MESSAGES.EMAIL_MISSING);
      let otp = functions.generateNumber(4)
      let expireTime = Number(Number(payload.timeZone) + 10)  // Otp expire after 10 min
      let tobeUpdated = {
          otp : otp,
          otpExpire : new Date(moment().add(expireTime , "m"))
      }
      let payloadData =  {
        to: email,
        title: "Verify your account",
        message: `Please, use this code address to verify your account - <b>${otp}</b>`,
      };
      await Model.User.findOneAndUpdate({
          _id : payload.userId
      }, {
          $set : tobeUpdated
      },{
          new : true
      });

      await this.send(payloadData)
    } catch (error) {
      console.error("sendEmailVerification", error);
    }
};

exports.sendBroadCastingEmail = async (payload) => {
    try {
        if(!payload.message) throw new Error(constants.MESSAGES.MESSAGE_BODY_MISSING)
        if(!payload.title) throw new Error(constants.MESSAGES.MESSAGE_TITLE_MISSING)
        const users = await Model.User.find({
            isDeleted : false,
            isBlocked : false
        })
        for(let i = 0 ; i < users.length ; i++){
            let payloadData =  {
              to: users[i].email,
              title: payload.title,
              message: payload.message,
            };
            await this.send(payloadData)
        }
    } catch (error) {
      console.error("sendBroadCastingEmail", error);
    }
};

exports.adminForgetPassword = async (payload) => {
    try {
        if(!payload.email) throw new Error(constants.MESSAGES.EMAIL_MISSING)
        const adminData = await Model.Admin.findOne({
            isDeleted : false,
            email : payload.email
        }).lean()
        if(adminData == null) throw new Error(constants.MESSAGES.ADMIN_NOT_FOUND)
        const password = functions.generateRandomStringAndNumbers(8)
        await adminData.setPassword(password)
        let payloadData =  {
          to: adminData.email,
          title: "Reset Paswword",
          message: `Please, use this one time password to reset your password ${password}`
        };
        await this.send(payloadData)
        adminData.save()
    } catch (error) {
      console.error("sendEmailVerification", error);
    }
};

exports.sendAdminEmailVerification = async (payload) => {
    try {
    if (!payload.timeZone) throw new Error(constants.MESSAGES.TIME_MISSING); // TimeZone difference from iso 
    if (!payload.adminId) throw new Error(constants.MESSAGES.USER_DATA_MISSING);
    if (!payload.email) throw new Error(constants.MESSAGES.EMAIL_MISSING);
      let otp = functions.generateNumber(4)
      let expireTime = Number(Number(payload.timeZone) + 10)  // Otp expire after 10 min
      let tobeUpdated = {
          otp : otp,
          otpExpire : new Date(moment().add(expireTime , "m"))
      }
      let payloadData =  {
        to: email,
        title: "Verify your account",
        message: `Please, use this code address to verify your account - <b>${otp}</b>`,
      };
      await Model.Admin.findOneAndUpdate({
          _id : payload.adminId
      }, {
          $set : tobeUpdated
      },{
          new : true
      });

      await this.send(payloadData)
    } catch (error) {
      console.error("sendEmailVerification", error);
    }
};