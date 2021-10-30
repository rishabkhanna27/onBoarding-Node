const Model = require("../../models/index")
const Validation = require("../validations");
const Auth = require("../../common/authenticate");
const smsService = require("../../services/smsService")
const mailService = require('../../services/EmalService')
const moment = require('moment');
const constants = require("../../common/constants");


//OnBoarding

module.exports.socialLogin = async (req, res, next) => {
    try {
      await Validation.User.socialLogin.validateAsync(req.body);
      const socials = [];
      req.body.appleId && socials.push({
        appleId: req.body.appleId
      });
      req.body.googleId && socials.push({
        googleId: req.body.googleId
      });
      req.body.facebookId && socials.push({
        facebookId: req.body.facebookId
      });
      if (!socials.length) throw new Error("MISSING_SOCIAL_HANDLE");
  
      let user = await Model.User.findOne({
        $or: socials
      });
      let successMessage = "LOGIN_SUCCESSFULLY";
  
      if (!user) {
        user = await Model.User.create(req.body);
        successMessage = "REGISTER_SUCCESSFULLY";
      }
      req.body.userId = user._id

      user.accessToken = await Auth.getToken({
        _id: user._id
      });
  
      if (user.email) {
        user.isEmailVerified = true;
      }
      if (user.phone) {
        user.isPhoneVerified = true;
      }
      await user.save();
      return res.success(successMessage, user);
    } catch (error) {
      next(error);
    }
};
module.exports.registerWithPhone = async (req, res, next) => {
    try {
        await Validation.User.register.validateAsync(req.body);
        let timeZone = req.body.timeZone || 330
        const userId = req.identity
        req.body.userName = req.body.firstName + ' ' + req.body.lastName;
        if (req.body.phoneNo) {
            const checkPhone = await Model.User.findOne({
                phoneNo: req.body.phoneNo,
                dialCode: req.body.dialCode,
                isDeleted: false,
            })
            if (checkPhone) {
                if (!checkPhone.isPhoneVerified) {
                    const del = await Model.User.deleteOne({
                        phoneNo: req.body.phoneNo,
                        dialCode: req.body.dialCode,
                        isDeleted: false,
                    })
                    const doc = await Model.User.create(req.body);
                    await doc.setPassword(req.body.password);
                    doc.accessToken = await Auth.getToken({
                        _id: doc._id
                    });
                    await doc.save();
                    if (req.body.dialCode && req.body.phoneNo) {
                        let dataToSend = {
                            userId : userId,
                            phoneNo : req.body.phoneNo,
                            dialCode : req.body.dialCode,
                            timeZone : timeZone
                        }
                        await smsService.sendPhoneVerification(dataToSend)
                    }
                    return res.success(constants.MESSAGES.ACCOUNT_CREATED_SUCCESSFULLY, doc);
                }else{
                throw new Error(constants.MESSAGES.PHONE_ALREADY_IN_USE);
                }
            }else{
                const doc = await Model.User.create(req.body);
                await doc.setPassword(req.body.password);
                doc.accessToken = await Auth.getToken({
                    _id: doc._id
                });
                await doc.save();
                if (req.body.dialCode && req.body.phoneNo) {
                    let dataToSend = {
                        userId : userId,
                        phoneNo : req.body.phoneNo,
                        dialCode : req.body.dialCode,
                        timeZone : timeZone
                    }
                    await smsService.sendPhoneVerification(dataToSend)
                }
                return res.success(constants.MESSAGES.ACCOUNT_CREATED_SUCCESSFULLY, doc);
            }
        }
    } catch (error) {
        next(error);
    }
};
module.exports.registerWithEmail = async (req, res, next) => {
    try {
        await Validation.User.register.validateAsync(req.body);
        let timeZone = req.body.timeZone || 330
        const userId = req.identity
        req.body.userName = req.body.firstName + ' ' + req.body.lastName;
        if (req.body.email) {
            const checkEmail = await Model.User.findOne({
                email: req.body.email,
                isDeleted: false
            })
            if (checkEmail) {
                if (!checkEmail.isEmailVerified) {
                    const del = await Model.User.deleteOne({
                        email: req.body.email,
                        isDeleted: false
                    })
                    const doc = await Model.User.create(req.body);
                    await doc.setPassword(req.body.password);
                    doc.accessToken = await Auth.getToken({
                        _id: doc._id
                    });
                    await doc.save();
                    if (req.body.email) {
                        let dataToSend = {
                            userId : userId,
                            email : req.body.email,
                            timeZone : timeZone
                        }
                        await mailService.sendEmailVerification(dataToSend)
                    }
                    return res.success(constants.MESSAGES.ACCOUNT_CREATED_SUCCESSFULLY, doc);
                }else{
                    throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE);
                }
            }else{
                const doc = await Model.User.create(req.body);
                await doc.setPassword(req.body.password);
                doc.accessToken = await Auth.getToken({
                    _id: doc._id
                });
                await doc.save();
                if (req.body.email) {
                    let dataToSend = {
                        userId : userId,
                        email : req.body.email,
                        timeZone : timeZone
                    }
                    await mailService.sendEmailVerification(dataToSend)
                }
                return res.success(constants.MESSAGES.ACCOUNT_CREATED_SUCCESSFULLY, doc);
            }
        }
    } catch (error) {
        next(error);
    }
};
module.exports.login = async (req, res, next) => {
    try {
      await Validation.User.login.validateAsync(req.body);
      let timeZone = req.body.timeZone || 330
      const criteria = [];
      if (req.body.email) {
        criteria.push({
          email: req.body.email
        });
      } else if (req.body.phone && req.body.dialCode) {
        criteria.push({
          phone: req.body.phone,
          dialCode: req.body.dialCode,
        });
      }
      const doc = await Model.User.findOne({
        $or: criteria,
        isDeleted: false,
      });
      if (!doc) throw new Error(constants.MESSAGES.INVALID_CREDENTIALS);
      if (doc.isBlocked) throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED);

      await doc.authenticate(req.body.password);
      if (req.body.email && !doc.isEmailVerified) {
        let dataToSend = {
            userId : req.user._id,
            email : req.body.email,
            timeZone : req.body.timeZone
        }
        await mailService.sendEmailVerification(dataToSend)
        return res.success("Please complete your registration", doc);
      }
      if (req.body.phone && !doc.isPhoneVerified) {
        let dataToSend = {
            userId : req.user._id,
            phoneNo : req.body.phoneNo,
            dialCode : req.body.dialCode,
            timeZone : timeZone
        }
        await smsService.sendPhoneVerification(dataToSend)
        return res.success("Please complete your registration", doc);
      }
  
      doc.loginCount += 1;
      doc.accessToken = await Auth.getToken({
        _id: doc._id
      });
      doc.deviceToken = req.body.deviceToken;
      doc.deviceType = req.body.deviceType;
      await doc.save();
      return res.success(constants.MESSAGES.LOGIN_SUCCESS, doc);
    } catch (error) {
      next(error);
    }
};
module.exports.logout = async (req, res, next) => {
    try {
        await Model.User.updateOne({
            _id: req.user._id,
            isDeleted : false
        }, {
            accessToken: ""
        });
        return res.success(constants.MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
        next(error);
    }
};
module.exports.getProfile = async (req, res, next) => {
    try {
        let doc = await Model.User.findOne({
            _id: req.user._id,
            isDeleted : false
        },{
            password : 0
        }).lean()
        return res.success(constants.MESSAGES.DATA_FETCHED, doc);
    } catch (error) {
        next(error);
    }
};
module.exports.updateProfile = async (req, res, next) => {
    try {
        await Validation.User.updateProfile.validateAsync(req.body);
        let timeZone = req.body.timeZone || 330
        const nin = {
            $nin: [req.user._id]
        };
        if (req.body.phoneNo) {
            let checkPhone = await Model.User.findOne({
                _id: nin,
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
            });
            if (checkPhone){
                throw new Error(constants.MESSAGES.PHONE_ALREADY_IN_USE);
            }else{
                checkPhone = await Model.User.findOne({
                    _id: req.user._id,
                    dialCode: req.body.dialCode,
                    phoneNo: req.body.phoneNo,
                    isDeleted: false,
                });
                if(checkPhone == null){
                    req.body.isPhoneVerified = false
                    let dataToSend = {
                        userId : req.user._id,
                        phoneNo : req.body.phoneNo,
                        dialCode : req.body.dialCode,
                        timeZone : timeZone
                    }
                    await smsService.sendPhoneVerification(dataToSend)
                }
            }
        }
        if (req.body.email) {
            let checkEmail = await Model.User.findOne({
                _id: nin,
                email: req.body.email,
                isDeleted: false,
            });
            if (checkEmail){
                throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE);
            }else{
                checkEmail = await Model.User.findOne({
                    _id: req.user._id,
                    email: req.body.email,
                    isDeleted: false,
                });
                if(checkEmail == null){
                    req.body.isEmailVerified = false
                    let dataToSend = {
                        userId : req.user._id,
                        email : req.body.email,
                        timeZone : timeZone
                    }
                    await mailService.sendEmailVerification(dataToSend)
                }
            }
        }
        let location = {}
        let coordinates = []
        if (req.body.latitude && req.body.longitude) {
            coordinates.push(Number(req.body.longitude))
            coordinates.push(Number(req.body.latitude))
            location.type = "Point";
            location.coordinates = coordinates
            req.body.location = location;
        }
        req.body.profileStatus = constants.PROFILE_STATUS.PERSONAL_DETAILS;
        if (req.body.image == "") {
            delete req.body.image
        }
        const updated = await Model.User.findOneAndUpdate({
            _id: req.user._id,
            isDeleted : false
        }, {
            $set: req.body
        }, {
            new: true
        })
        if(updated){
            return res.success(constants.MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, updated);
        }else{
            throw new Error(constants.MESSAGES.NO_DATA_SUCCESS)
        }
    } catch (error) {
        next(error);
    }
};
module.exports.deleteProfile = async (req, res, next) => {
    try {
        let doc = await Model.User.findOneAndUpdate({
            _id: req.user._id
        },{
            $set: { isDeleted : true}
        },{
            new : true
        })
        return res.success(constants.MESSAGES.ACCOUNT_DELETED);
    } catch (error) {
        next(error);
    }
};
module.exports.sendOtp = async (req, res, next) => {
    try {
        await Validation.Customer.sendOTP.validateAsync(req.body);
        let timeZone = req.body.timeZone || 330
        let doc = null;
        if (req.body.phoneNo) {
            doc = await Model.User.findOne({
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
            });
            let dataToSend = {
                userId : req.user._id,
                phoneNo : req.body.phoneNo,
                dialCode : req.body.dialCode,
                timeZone : timeZone
            }
            await smsService.sendPhoneVerification(dataToSend)
        }
        if (req.body.email) {
            doc = await Model.User.findOne({
                email: req.body.email,
                isDeleted: false,
            });
            let dataToSend = {
                userId : req.user._id,
                email : req.body.email,
                timeZone : timeZone
            }
            await mailService.sendEmailVerification(dataToSend)
        }
        if (!doc) throw new Error(constants.MESSAGES.USER_DATA_MISSING);
        if (doc.isBlocked) throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED);

        return res.success(constants.MESSAGES.OTP_SENT);
    } catch (error) {
        next(error);
    }
};
module.exports.verifyOtp = async (req, res, next) => {
    try {
      await Validation.User.verifyOTP.validateAsync(req.body);
      let timeZone = req.body.timeZone || 330
      let doc = null;
    // Verify credentials
      if (req.body.email) {
        doc = await Model.User.findOne({
            email: req.body.email,
            isDeleted: false,
        });
      } else if (req.body.phoneNo) {
        doc = await Model.User.findOne({
            dialCode: req.body.dialCode,
            phoneNo: req.body.phoneNo,
            isDeleted: false,
        });
      }
      if (!doc) throw new Error(constants.MESSAGES.USER_DATA_MISSING);
      if (doc.isBlocked) throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED);
    // Verify expire otp
      doc = await Model.User.findOne({
          _id : doc._id,
          otpExpire : {$gte : new Date(moment().add(timeZone, "m"))}
      }).lean()
      if(!doc) throw new Error(constants.MESSAGES.OTP_EXPIRED)
    // Verify Otp
      if(req.body.otp != doc.otp){
          throw new Error(constants.MESSAGES.INVALID_OTP)
      }
      doc.otp = "",
      doc.otpExpire = "",
      doc.accessToken = await Auth.getToken({
        _id: doc._id
      });
      if (req.body.email) {
        doc.isEmailVerified = true;
      }
      if (req.body.phone) {
        doc.isPhoneVerified = true;
      }
      await doc.save();
      return res.success(constants.MESSAGES.ACCOUNT_VERIFIED, doc);
    } catch (error) {
      next(error);
    }
};
module.exports.uploadFile = async (req, res, next) => {
    try {
        if (!req.file) throw new Error(constants.MESSAGES.UPLOADING_ERROR);
        const filePath = req.file;
        const image = filePath.location;
        return res.success(constants.MESSAGES.IMAGE_UPLOADED, {
            image
        });
    } catch (error) {
        next(error);
    }
};